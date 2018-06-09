import { Injectable } from '@angular/core';
import { StoryService } from './story.service'

import { StoryDocument, StoryMetaData } from '../_models/index';
import { BehaviorSubject, Observable } from 'rxjs';
import { reject } from 'q';

@Injectable()
export class StoryEditorService {
	private currentStory: BehaviorSubject<string> = new BehaviorSubject<string>(undefined);
	private cachedStories: Map<string, BehaviorSubject<StoryMetaData>> = new Map<string, BehaviorSubject<StoryMetaData>>();
	private cachedStoryDocs: Map<string, BehaviorSubject<StoryDocument>> = new Map<string, BehaviorSubject<StoryDocument>>();

	constructor(private storyService: StoryService) {

	}

	setCurrentlyViewedStory(storyId: string) {
		this.currentStory.next(storyId)
	}

	getCurrentlyViewedStory(): Observable<string> {
		return this.currentStory.asObservable()
	}

	loadStory(storyId: string): Promise<StoryMetaData> {
		this.currentStory.next(storyId)

		return new Promise((resolve, reject) => {
			this.storyService.getStory(storyId).then((story) => {
				this.storyService.getStoryDocuments(story.storyURIs).then((documents: StoryDocument[]) => {
					documents.forEach(doc => {
						let cachedDoc = this.cachedStoryDocs.get(doc.URI)
						if (cachedDoc == undefined) {
							cachedDoc = new BehaviorSubject<StoryDocument>(doc)
							this.cachedStoryDocs.set(doc.URI, cachedDoc)
						}
						cachedDoc.next(doc)
					})

					let cachedStory = this.cachedStories.get(storyId)
					if (cachedStory == undefined) {
						cachedStory = new BehaviorSubject<StoryMetaData>(story)
						this.cachedStories.set(storyId, cachedStory)
					}
					cachedStory.next(story)
					resolve(story)
				}).catch(e => reject(e))
			}).catch(e => reject(e))
		})
	}

	saveDocument(uri: string): Promise<any> {
		return new Promise((resolve, reject) => {
			let document = this.cachedStoryDocs.get(uri)
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

	updateDocumentContent(uri: string, docContent: any) {
		let storyDocBehaviour = this.cachedStoryDocs.get(uri)
		if (storyDocBehaviour) {
			let storyDoc = storyDocBehaviour.getValue()
			if (storyDoc) {
				storyDoc.content = docContent
				storyDocBehaviour.next(storyDoc)
			} else {
				console.error("UpdateDocumentContent - Document is invalid")
			}
		}
		else {
			console.error("UpdateDocumentContent - Document does not exist")
		}
	}

	getStory(storyId: string): Observable<StoryMetaData> {
		let story = this.cachedStories.get(storyId)
		if (story == undefined) {
			story = new BehaviorSubject<StoryMetaData>(undefined)
			this.cachedStories.set(storyId, story)
		}
		return story.asObservable()
	}

	getStoryDocument(storyURI: string): Observable<StoryDocument> {
		let storyDoc = this.cachedStoryDocs.get(storyURI)
		if (storyDoc == undefined) {
			storyDoc = new BehaviorSubject<StoryDocument>(undefined)
			this.cachedStoryDocs.set(storyURI, storyDoc)
		}
		return storyDoc.asObservable()
	}
}