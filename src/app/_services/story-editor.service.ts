import { Injectable } from '@angular/core';
import { StoryService } from './story.service'

import { StoryMetaData, ChapterMetaData } from '../_models/index';
import { BehaviorSubject, Observable } from 'rxjs';

// for some reason the @types/quill are broken, have to use this instead
import * as Quill from 'quill'
import * as Delta from 'quill-delta'
/*
 TODO: 
 "Quill.register('modules/imageResize', ImageResize)"
 is called in image-resize.min.js which causes a double register, it seams to work anyways but it causes a warning.
 */
// add image resize module
import ImageResize from 'quill-image-resize-module'
Quill.register('modules/imageResize', ImageResize)

/*
	Hack to solve a bug in Quill where image formats are not whitelisted properly.
	For more info, read: https://github.com/kensnyder/quill-image-resize-module/issues/10
*/
var ImageFormat = Quill.import('formats/image');
const ImageFormatAttributesList = [
    'alt',
    'height',
    'width',
    'style'
];

ImageFormat.formats = function formats(domNode: any): any {
	return ImageFormatAttributesList.reduce(
			(formats, attribute) => {
					if (domNode.hasAttribute(attribute)) {
							formats[attribute] = domNode.getAttribute(attribute)
					}
					return formats
			},
			{}
	)
}

ImageFormat.prototype.format = function format(name: string, value: any): void {
	if (ImageFormatAttributesList.indexOf(name) !== -1) {
			if (value) {
					this.domNode.setAttribute(name, value)
			} else {
					this.domNode.removeAttribute(name)
			}
	} else {
			this.super.format(name, value)
	}
}
Quill.register(ImageFormat, true)

// Add fonts to whitelist
var Font = Quill.import('formats/font')
// We do not add Aref Ruqaa since it is the default
Font.whitelist = ['mirza', 'aref', 'sans-serif', 'monospace', 'serif']
Quill.register(Font, true)

@Injectable()
export class StoryEditorService {
	private currentStory: BehaviorSubject<StoryMetaData> = new BehaviorSubject<StoryMetaData>(undefined);
	private currentChapter: BehaviorSubject<ChapterMetaData> = new BehaviorSubject<ChapterMetaData>(undefined)
	private editor: Quill

	constructor(private storyService: StoryService) {

	}

	public getCurrentStory(): Observable<StoryMetaData> {
		return this.currentStory.asObservable()
	}

	public getCurrentChapter(): Observable<ChapterMetaData> {
		return this.currentChapter.asObservable()
	}

	public createEditor(
		storyId: string,
		editorContainer: string,
		toolbarContainer: string,
		scrollingContainer: string
	): Promise<StoryMetaData> {
		return new Promise((resolve, reject) => {
			this.currentStory.next(undefined)
			this.currentChapter.next(undefined)

			this.storyService.getStory(storyId).then((story) => {
				this.storyService.setCurrentlyViewedStory(story)

				this.editor = new Quill(editorContainer, {
					modules: { toolbar: { container: toolbarContainer }, imageResize: {} },
					scrollingContainer: scrollingContainer,
					theme: 'snow'
				});

				this.editor.on("text-change", (delta: Delta) => {
					//console.log(delta)
					//this.storyEditorService.updateDocumentContent(this.editor.getContents())
				})

				this.currentStory.next(story)
				resolve(story)
			}).catch(e => reject(e))
		})
	}

	public destroyEditor() {
		delete this.editor
		this.currentStory.next(undefined)
		this.currentChapter.next(undefined)
	}

	public editChapter(chapterId: string): Observable<ChapterMetaData> {
		if (this.editor) {
			this.currentChapter.next(undefined) // Clear current chapter
			this.editor.setText("...") // Clear the editor

			let chapter = this.currentStory.getValue().chapters.find(chapter => { return chapter.chapterId == chapterId })
			if (chapter) {
				this.currentChapter.next(chapter)
				this.storyService.getChapterContent(chapter.URI).then(content => {
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
				this.storyService.updateChapterContent(metaData.chapterId, content).then(() => {
					resolve()
				}).catch(e => {
					reject(e)
				})
			} else {
				reject("Failed to save doc - Could not find chapter")
			}
		})
	}

	public createNewChapter(title: string): Promise<StoryMetaData> {
		return new Promise<StoryMetaData>((resolve, reject) => {
			let story = this.currentStory.getValue()
			if (story) {
				this.storyService.createChapter(story.storyId, title).then((newChapter: ChapterMetaData) => {
					let story = this.currentStory.getValue()
					story.chapters.push(newChapter)
					this.currentStory.next(story)
					this.editChapter(newChapter.chapterId).subscribe(() => {
						resolve(story)
					}, e => reject(e))
				}).catch(e => reject(e))
			} else {
				reject("No valid story being editor")
			}
		})
	}

	public deleteCurrentChapter(): Promise<StoryMetaData> {
		return new Promise<StoryMetaData>((resolve, reject) => {
			let chapter = this.currentChapter.getValue()
			if (this.editor && chapter) {
				this.storyService.deleteChapter(chapter.chapterId).then(() => {
					let story = this.currentStory.getValue()
					story.chapters = story.chapters.filter(c => c.chapterId != chapter.chapterId)
				
					this.currentStory.next(story)
					if (story.chapters.length > 0) {
						let chapter = story.chapters[story.chapters.length - 1]
						this.editChapter(chapter.chapterId).subscribe(() => {
							resolve(story)
						}, e => reject(e))
					} else {
						this.currentChapter.next(undefined)
					}
				}).catch(e => reject(e))
			} else {
				reject("No valid story being editor")
			}
		})
	}

	public updateChapterMetaData(newChapterProperties: object): Promise<StoryMetaData> {
		return new Promise<StoryMetaData>((resolve, reject) => {
			let chapter = this.currentChapter.getValue()
			if (this.editor && chapter) {
				this.storyService.updateChapter(chapter.chapterId, newChapterProperties).then(() => {
					let story = this.currentStory.getValue()
					let index = story.chapters.findIndex(c => c.chapterId == chapter.chapterId)
					story.chapters[index] = chapter
					this.currentChapter.next(chapter)
					this.currentStory.next(story)
					resolve(story)
				}).catch(e => reject(e))
			} else {
				reject("No valid chapter is being edited")
			}
		})
	}

	public updateStory(newStoryProperties: object): Promise<StoryMetaData> {
		return new Promise<StoryMetaData>((resolve, reject) => {
			let story = this.currentStory.getValue()
			if (this.editor && story) {
				this.storyService.updateStory(story.storyId, newStoryProperties).then((story) => {
					this.currentStory.next(story)
					resolve(story)
				}).catch(e => reject(e))
			} else {
				reject("No valid story is being edited")
			}
		})
	}
}