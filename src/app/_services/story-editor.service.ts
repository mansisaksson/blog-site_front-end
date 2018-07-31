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

			this.storyService.getStoryChapter(chapterId).then((chapter) => {
				this.currentChapter.next(chapter.metaData)
				try {
					this.editor.setContents(JSON.parse(chapter.content))
				} catch (error) { this.editor.setContents() }
			}).catch(e => console.log(e))
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
				this.storyService.createChapter(story.storyId, title).then((updatedStory: StoryMetaData) => {
					this.currentStory.next(updatedStory)
					let chapter = updatedStory.chapters[updatedStory.chapters.length - 1]
					this.editChapter(chapter.chapterId).subscribe(() => {
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
			let chapter = this.currentChapter.getValue()
			if (this.editor && chapter) {
				this.storyService.deleteChapter(chapter.chapterId).then((updatedStory: StoryMetaData) => {
					this.currentStory.next(updatedStory)

					if (updatedStory.chapters.length > 0) {
						let chapter = updatedStory.chapters[updatedStory.chapters.length - 1]
						this.editChapter(chapter.chapterId).subscribe(() => {
							resolve(updatedStory)
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

	public renameChapter(newName: string): Promise<StoryMetaData> {
		return new Promise<StoryMetaData>((resolve, reject) => {
			let metaData = this.currentChapter.getValue()
			if (this.editor && metaData) {
				metaData.title = newName
				this.storyService.updateChapterMetaData(metaData.chapterId, metaData).then((story) => {
					this.currentChapter.next(metaData)
					this.currentStory.next(story)
					resolve(story)
				}).catch(e => reject(e))
			} else {
				reject("No valid chapter is being edited")
			}
		})
	}

	public renameStory(newName: string): Promise<StoryMetaData> {
		return new Promise<StoryMetaData>((resolve, reject) => {
			let story = this.currentStory.getValue()
			if (this.editor && story) {
				this.storyService.updateStoryName(story.storyId, newName).then((story) => {
					this.currentStory.next(story)
					resolve(story)
				}).catch(e => reject(e))
			} else {
				reject("No valid story is being edited")
			}
		})
	}
}