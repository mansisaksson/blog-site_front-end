import { Injectable } from '@angular/core';
import { StoryService } from './story.service'

import { StoryChapter, StoryMetaData, ChapterMetaData } from '../_models/index';
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

// Add fonts to whitelist
var Font = Quill.import('formats/font')
// We do not add Aref Ruqaa since it is the default
Font.whitelist = ['mirza', 'aref', 'sans-serif', 'monospace', 'serif']
Quill.register(Font, true)

@Injectable()
export class StoryEditorService {
	private currentStory: BehaviorSubject<StoryMetaData> = new BehaviorSubject<StoryMetaData>(undefined);
	private chapterMetaData: BehaviorSubject<ChapterMetaData> = new BehaviorSubject<ChapterMetaData>(undefined)
	private editor: Quill

	constructor(private storyService: StoryService) {

	}

	public getCurrentStory(): Observable<StoryMetaData> {
		return this.currentStory.asObservable()
	}

	public getCurrentChapter(): Observable<ChapterMetaData> {
		return this.chapterMetaData.asObservable()
	}

	public createEditor(
		storyId: string,
		editorContainer: string,
		toolbarContainer: string,
		scrollingContainer: string
	): Promise<StoryMetaData> {
		return new Promise((resolve, reject) => {
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
		this.chapterMetaData.next(undefined)
	}

	public editChapter(chapterURI: string): Observable<ChapterMetaData> {
		this.chapterMetaData.next(undefined) // Clear current chapter
		this.storyService.getStoryChapter(chapterURI).then((chapter) => {
			if (this.editor) {
				this.chapterMetaData.next(chapter.metaData)
				try {
					this.editor.setContents(JSON.parse(chapter.content))
				} catch (error) { this.editor.setContents() }
			}
		}).catch(e => console.log(e))
		
		return this.chapterMetaData.asObservable()
	}

	public saveCurrentChapter(): Promise<any> {
		return new Promise((resolve, reject) => {
			if (this.editor && this.chapterMetaData.getValue()) {
				let newChapter = <StoryChapter>{
					metaData: this.chapterMetaData.getValue(),
					content: JSON.stringify(this.editor.getContents())
				}
				this.storyService.updateChapter(newChapter).then(() => {
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
				this.storyService.createChapter(story.storyId, title).then((updatedStory: StoryMetaData) => {
					this.currentStory.next(updatedStory)
					let chapter = updatedStory.chapters[updatedStory.chapters.length - 1]
					this.editChapter(chapter.URI).subscribe(() => {
						resolve(updatedStory)
					}, e => reject(e))
				}).catch(e => reject(e))
			} else {
				reject("No valid story being editor")
			}
		})
	}

	public deleteCurrentChapter(): Promise<StoryMetaData> {
		return new Promise<StoryMetaData>((resolve, reject) => {
			let story = this.currentStory.getValue()
			let chaper = this.chapterMetaData.getValue()
			if (story && chaper) {
				this.storyService.deleteChapter(story.storyId, chaper.URI).then((updatedStory: StoryMetaData) => {
					this.currentStory.next(updatedStory)

					if (updatedStory.chapters.length > 0) {
						let chapter = updatedStory.chapters[updatedStory.chapters.length - 1]
						this.editChapter(chapter.URI).subscribe(() => {
							resolve(updatedStory)
						}, e => reject(e))
					} else {
						this.chapterMetaData.next(undefined)
					}
				}).catch(e => reject(e))
			} else {
				reject("No valid story being editor")
			}
		})
	}
	
	public renameChapter(newName: string): Promise<StoryMetaData> {
		return new Promise<StoryMetaData>((resolve, reject) => {
			// TODO
		})
	}

	public renameStory(newName: string): Promise<StoryMetaData> {
		return new Promise<StoryMetaData>((resolve, reject) => {
			// TODO
		})
	}
}