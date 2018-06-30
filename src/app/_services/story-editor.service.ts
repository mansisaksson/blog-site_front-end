import { Injectable } from '@angular/core';
import { StoryService } from './story.service'

import { StoryDocument, StoryMetaData } from '../_models/index';
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
	private currentDocURI: string
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
		this.currentDocURI = undefined
	}

	public saveDocument(): Promise<any> {
		return new Promise((resolve, reject) => {
			if (this.editor) {
				let newDoc = <StoryDocument>{
					URI: this.currentDocURI,
					content: JSON.stringify(this.editor.getContents())
				}
				this.storyService.updateStoryDocument(newDoc).then(() => {
					resolve()
				}).catch(e => {
					reject(e)
				})
			} else {
				reject("Failed to save doc - Could not find document")
			}
		})
	}

	public getStory(): Observable<StoryMetaData> {
		return this.currentStory.asObservable()
	}

	public editDocument(storyURI: string): Promise<StoryDocument> {
		this.currentDocURI = undefined // Clear current document
		return new Promise<StoryDocument>((resolve, reject) => {
			this.storyService.getStoryDocument(storyURI).then((document) => {
				if (this.editor) {
					this.currentDocURI = document.URI
					try {
						this.editor.setContents(JSON.parse(document.content))	
					} catch (error) {	}
					resolve(document)
				}
				else {
					reject()
				}
			}).catch(e => console.log(e))
		})
	}
}