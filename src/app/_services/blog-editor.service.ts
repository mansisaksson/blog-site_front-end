import { Injectable } from '@angular/core';
import { BlogPostService } from './blog-post.service'
import { AlertService } from './alert.service';

import { BlogPostMetaData, ChapterMetaData } from '../_models/index';
import { BehaviorSubject, Observable } from 'rxjs';

// for some reason the @types/quill are broken, have to use this instead
import * as Quill from 'quill'
import * as Delta from 'quill-delta'

/*
 TODO: 
 Quill.register('modules/imageResize', ImageResize) and Quill.register('modules/videoResize', VideoResize)
 is called in image-resize.min.js which causes a double register, it seams to work anyways but it causes a warning.
 */
// add image resize module
import ImageResize from 'quill-image-resize-module'
Quill.register('modules/imageResize', ImageResize)


// add video resize module
import VideoResize from 'quill-video-resize-module'
Quill.register('modules/videoResize', VideoResize)

/*
	~Begin Hack
	Hack to solve a bug in Quill where image/video formats are not whitelisted properly.
	For more info, read: https://github.com/kensnyder/quill-image-resize-module/issues/10
*/
function WhitelistAttributes(Format, Attributes) {
	Format.formats = function formats(domNode: any): any {
		return Attributes.reduce(
			(formats, attribute) => {
				if (domNode.hasAttribute(attribute)) {
					formats[attribute] = domNode.getAttribute(attribute)
				}
				return formats
			},
			{}
		)
	}
	
	Format.prototype.format = function format(name: string, value: any): void {
		if (Attributes.indexOf(name) !== -1) {
			if (value) {
				this.domNode.setAttribute(name, value)
			} else {
				this.domNode.removeAttribute(name)
			}
		} else {
			this.super.format(name, value)
		}
	}
}

const ImageFormatAttributesList = [
	'alt',
	'height',
	'width',
	'style'
];

var ImageFormat = Quill.import('formats/image');
WhitelistAttributes(ImageFormat, ImageFormatAttributesList)
Quill.register(ImageFormat, true)

var VideoFormat = Quill.import('formats/video');
WhitelistAttributes(VideoFormat, ImageFormatAttributesList)
Quill.register(VideoFormat, true)
/*
	~End hack
*/

// Add fonts to whitelist
var Font = Quill.import('formats/font')
// We do not add Aref Ruqaa since it is the default
Font.whitelist = ['mirza', 'aref', 'sans-serif', 'monospace', 'serif']
Quill.register(Font, true)

@Injectable()
export class BlogPostEditorService {
	private currentBlog: BehaviorSubject<BlogPostMetaData> = new BehaviorSubject<BlogPostMetaData>(undefined);
	private currentChapter: BehaviorSubject<ChapterMetaData> = new BehaviorSubject<ChapterMetaData>(undefined)
	private editor: Quill

	constructor(
		private BlogPostService: BlogPostService,
		private alertService: AlertService
	) {

	}

	public getCurrentBlog(): Observable<BlogPostMetaData> {
		return this.currentBlog.asObservable()
	}

	public getCurrentChapter(): Observable<ChapterMetaData> {
		return this.currentChapter.asObservable()
	}

	public createEditor(
		blogPostId: string,
		editorContainer: string,
		toolbarContainer: string,
		scrollingContainer: string
	): Promise<BlogPostMetaData> {
		return new Promise((resolve, reject) => {
			this.currentBlog.next(undefined)
			this.currentChapter.next(undefined)

			this.BlogPostService.getBlogPost(blogPostId).then((blogPost) => {
				this.BlogPostService.setCurrentlyViewedBlogPost(blogPost)

				this.editor = new Quill(editorContainer, {
					modules: {
						toolbar: { container: toolbarContainer },
						imageResize: {},
						videoResize: {}
					},
					scrollingContainer: scrollingContainer,
					theme: 'snow'
				})

				this.editor.on("text-change", (delta: Delta) => {
					//console.log(delta)
					//this.blogEditorService.updateDocumentContent(this.editor.getContents())
				})

				// Save shortcut
				this.editor.keyboard.addBinding({
					key: 'S',
					ctrlKey: true,
					handler: () => {
						this.saveCurrentChapter().then(() => {
							this.alertService.success("Chapter saved!")
						}).catch(e => this.alertService.error(e))
					}
				})

				this.currentBlog.next(blogPost)
				resolve(blogPost)
			}).catch(e => reject(e))
		})
	}

	public destroyEditor() {
		delete this.editor
		this.currentBlog.next(undefined)
		this.currentChapter.next(undefined)
	}

	public editChapter(chapterId: string): Observable<ChapterMetaData> {
		if (this.editor) {
			this.currentChapter.next(undefined) // Clear current chapter
			this.editor.setText("...") // Clear the editor

			let chapter = this.currentBlog.getValue().chapters.find(chapter => { return chapter.chapterId == chapterId })
			if (chapter) {
				this.currentChapter.next(chapter)
				this.BlogPostService.getChapterContent(chapter.URI).then(content => {
					try {
						this.editor.setContents(JSON.parse(content.content))
					} catch (error) { this.editor.setContents() }
				}).catch(e => console.log(e))
			}
		}
		return this.currentChapter.asObservable()
	}

	public saveCurrentChapter(): Promise<any> {
		return new Promise((resolve, reject) => {
			let metaData = this.currentChapter.getValue()
			if (this.editor && metaData) {
				let content = JSON.stringify(this.editor.getContents())
				this.BlogPostService.updateChapterContent(metaData.chapterId, content).then(() => {
					resolve()
				}).catch(e => {
					reject(e)
				})
			} else {
				reject("Failed to save doc - Could not find chapter")
			}
		})
	}

	public createNewChapter(title: string): Promise<BlogPostMetaData> {
		return new Promise<BlogPostMetaData>((resolve, reject) => {
			let blogPost = this.currentBlog.getValue()
			if (blogPost) {
				this.BlogPostService.createChapter(blogPost.storyId, title).then((newChapter: ChapterMetaData) => {
					blogPost.chapters.push(newChapter)
					this.currentBlog.next(blogPost)
					this.editChapter(newChapter.chapterId).subscribe(() => {
						resolve(blogPost)
					}, e => reject(e))
				}).catch(e => reject(e))
			} else {
				reject("No valid blogPost being editor")
			}
		})
	}

	public deleteCurrentChapter(): Promise<BlogPostMetaData> {
		return new Promise<BlogPostMetaData>((resolve, reject) => {
			let chapter = this.currentChapter.getValue()
			if (this.editor && chapter) {
				this.BlogPostService.deleteChapter(chapter.chapterId).then((blogPost) => {
					this.currentBlog.next(blogPost)
					if (blogPost.chapters.length > 0) {
						let chapter = blogPost.chapters[blogPost.chapters.length - 1]
						this.editChapter(chapter.chapterId).subscribe(() => {
							resolve(blogPost)
						}, e => reject(e))
					} else {
						this.currentChapter.next(undefined)
					}
				}).catch(e => reject(e))
			} else {
				reject("No valid blogPost being edited")
			}
		})
	}

	public updateChapterMetaData(newChapterProperties: object): Promise<BlogPostMetaData> {
		return new Promise<BlogPostMetaData>((resolve, reject) => {
			let chapter = this.currentChapter.getValue()
			if (this.editor && chapter) {
				this.BlogPostService.updateChapter(chapter.chapterId, newChapterProperties).then((newChapter) => {
					chapter = newChapter
					let blogPost = this.currentBlog.getValue()
					let index = blogPost.chapters.findIndex(c => c.chapterId == chapter.chapterId)
					blogPost.chapters[index] = chapter
					this.currentChapter.next(chapter)
					this.currentBlog.next(blogPost)
					resolve(blogPost)
				}).catch(e => reject(e))
			} else {
				reject("No valid chapter is being edited")
			}
		})
	}

	public swapChapterOrder(chapter1: string, chapter2: string): Promise<BlogPostMetaData> {
		return new Promise<BlogPostMetaData>((resolve, reject) => {
			let blogPost = this.currentBlog.getValue()
			let chapter1Index = blogPost.chapters.findIndex(c => c.chapterId == chapter1)
			let chapter2Index = blogPost.chapters.findIndex(c => c.chapterId == chapter2)
			if (chapter1Index != -1 && chapter2Index != -1) {
				let chapterIds = blogPost.chapters.map(c => c.chapterId)
				let tmp = chapterIds[chapter1Index]
				chapterIds[chapter1Index] = chapterIds[chapter2Index]
				chapterIds[chapter2Index] = tmp
				this.updateBlogPost({ chapters: chapterIds }).then((newBlog) => {
					resolve(newBlog)
				}).catch(e => reject(e))
			} else {
				this.alertService.error("Unable to swap chapters")
			}
		})
	}

	public updateBlogPost(newBlogProperties: object): Promise<BlogPostMetaData> {
		return new Promise<BlogPostMetaData>((resolve, reject) => {
			let blogPost = this.currentBlog.getValue()
			if (this.editor && blogPost) {
				this.BlogPostService.updateBlogPost(blogPost.storyId, newBlogProperties).then((blogPost) => {
					this.currentBlog.next(blogPost)
					resolve(blogPost)
				}).catch(e => reject(e))
			} else {
				reject("No valid blogPost is being edited")
			}
		})
	}
}