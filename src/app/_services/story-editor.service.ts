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
	private chapterMetaData: ChapterMetaData
  private editor: Quill

	constructor(private storyService: StoryService) {

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
		this.chapterMetaData = undefined
	}

	public saveChapter(): Promise<any> {
		return new Promise((resolve, reject) => {
			if (this.editor && this.chapterMetaData) {
				let newChapter = <StoryChapter>{
					metaData: this.chapterMetaData,
					content: JSON.stringify(this.editor.getContents())
				}
				this.storyService.updateStoryChapter(newChapter).then(() => {
					resolve()
				}).catch(e => {
					reject(e)
				})
			} else {
				reject("Failed to save doc - Could not find chapter")
			}
		})
	}

	public getStory(): Observable<StoryMetaData> {
		return this.currentStory.asObservable()
	}

	public editChapter(chapterURI: string): Promise<ChapterMetaData> {
		this.chapterMetaData = undefined // Clear current chapter
		return new Promise<ChapterMetaData>((resolve, reject) => {
			this.storyService.getStoryChapter(chapterURI).then((chapter) => {
				if (this.editor) {
					this.chapterMetaData = chapter.metaData
					try {
						this.editor.setContents(JSON.parse(chapter.content))	
					} catch (error) {	}
					resolve(chapter.metaData)
				}
				else {
					reject()
				}
			}).catch(e => console.log(e))
		})
	}
}