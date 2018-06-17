import { Injectable } from '@angular/core';
import { StoryService } from './story.service'

import { StoryDocument, StoryMetaData } from '../_models/index';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable()
export class StoryEditorService {
	private currentStory: BehaviorSubject<StoryMetaData> = new BehaviorSubject<StoryMetaData>(undefined);
	private currentStoryDocs: { [key: string]: BehaviorSubject<StoryDocument> } = {}

	constructor(private storyService: StoryService) {

	}

	private updateStoryDocs(newDocs: StoryDocument[]) {
		newDocs.forEach(newDoc => {
			if (this.currentStoryDocs[newDoc.URI] != undefined) {
				this.currentStoryDocs[newDoc.URI].next(newDoc)
			}
			else {
				this.currentStoryDocs[newDoc.URI] = new BehaviorSubject<StoryDocument>(newDoc)
			}
		})

		Object.keys(this.currentStoryDocs).forEach((key: string) => {
			if (!newDocs.find((value) => { return value.URI == key })) {
				this.currentStoryDocs[key] = undefined
			}
		})
	}

	public loadStory(storyId: string): Promise<StoryMetaData> {
		return new Promise((resolve, reject) => {
			this.storyService.getStory(storyId).then((story) => {
				this.storyService.getStoryDocuments(story.storyURIs).then((documents: StoryDocument[]) => {
					this.updateStoryDocs(documents)
					this.currentStory.next(story)
					resolve(story)
				}).catch(e => reject(e))
			}).catch(e => reject(e))
		})
	}

	public saveDocument(uri: string): Promise<any> {
		return new Promise((resolve, reject) => {
			let document = this.currentStoryDocs[uri]
			if (document) {
				this.storyService.updateStoryDocument(uri, document.getValue()).then(() => {
					resolve()
				}).catch(e => {
					reject(e)
				})
			} else {
				reject("Failed to save doc - Could not find document")
			}
		})
	}

	public saveAll(): Promise<any> {
		return new Promise((resolve, reject) => {
			let story = this.currentStory.getValue()
			if (story)
			{
				story.storyURIs.forEach(uri => {
					let document = this.currentStoryDocs[uri]
					if (document) {
						this.storyService.updateStoryDocument(uri, document.getValue()).then(() => {
							// TODO: check for failure 
						}).catch(e => console.log(e))
					}
				})
				resolve()
			} else {
				reject("saveAll - No story being edited")
			}
		})
	}

	public updateDocument(uri: string, document: StoryDocument) {
		let storyDocBehaviour = this.currentStoryDocs[uri]
		if (storyDocBehaviour) {
			let storyDoc = storyDocBehaviour.getValue()
			if (storyDoc) {
				storyDocBehaviour.next(document)
			} else {
				console.error("UpdateDocumentContent - Document is invalid")
			}
		}
		else {
			console.error("UpdateDocumentContent - Document does not exist")
		}
	}

	public getStory(): Observable<StoryMetaData> {
		return this.currentStory.asObservable()
	}

	public getStoryDocument(storyURI: string): Observable<StoryDocument> {
		if (this.currentStoryDocs[storyURI] == undefined) {
			this.currentStoryDocs[storyURI] = new BehaviorSubject<StoryDocument>(undefined)
		}
		return this.currentStoryDocs[storyURI].asObservable()
	}
}