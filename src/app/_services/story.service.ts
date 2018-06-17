import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { StoryDocument, StoryMetaData } from '../_models/index';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable()
export class StoryService {
	private currentStory: BehaviorSubject<StoryMetaData> = new BehaviorSubject<StoryMetaData>(undefined)

	constructor(private http: HttpClient) { }

	setCurrentlyViewedStory(story: StoryMetaData) {
		this.currentStory.next(story)
	}

	getCurrentlyViewedStory(): Observable<StoryMetaData> {
		return this.currentStory.asObservable()
	}

	getStoryDocument(docURI: string): Promise<StoryDocument> {
		return new Promise<StoryDocument>((resolve, reject) => {
			let uriArray = [docURI]

			this.getStoryDocuments(uriArray).then((data) => {
				resolve(data[0])
			}).catch((e) => {
				reject(e)
			})
		})
	}

	getStoryDocuments(docURIs: string[]): Promise<StoryDocument[]> {
		return new Promise<StoryDocument[]>((resolve, reject) => {
			let params = {
				URIs: JSON.stringify(docURIs)
			}
			this.http.get('/api/stories', { params: params }).subscribe((data) => {
				resolve(<StoryDocument[]>data)
			}, (error) => {
				reject(error)
			})
		})
	}

	createStory(userId: string): Promise<StoryMetaData> {
		return new Promise<StoryMetaData>((resolve, reject) => {
			this.http.post('/api/stories', userId).subscribe((data) => {
				resolve(<StoryMetaData>data)
			}, (error) => {
				reject(error)
			})
		})
	}

	updateStoryDocument(uri: string, story: StoryDocument): Promise<boolean> {
		return new Promise<boolean>((resolve, reject) => {
			let params = {
				uri: uri
			}
			this.http.put('/api/stories', story, { params: params }).subscribe((data) => {
				resolve(<boolean>data)
			}, (error) => {
				reject(error)
			})
		})
	}

	deleteStory(id: string): Promise<boolean> {
		return new Promise<boolean>((resolve, reject) => {
			let params = {
				storyId: id
			}
			this.http.delete('/api/stories', { params: params }).subscribe((data) => {
				resolve(<boolean>data)
			}, (error) => {
				reject(error)
			})
		})

	}

	getStories(userId?: string, searchQuery?: string): Promise<StoryMetaData[]> {
		return new Promise<StoryMetaData[]>((resolve, reject) => {
			let params = {
				userId: userId ? userId.toString() : undefined,
				searchQuery: searchQuery
			}

			this.http.get<StoryMetaData[]>('/api/stories_md/query', { params: params }).subscribe((data) => {
				resolve(data)
			}, (error) => {
				reject(error)
			})
		});
	}

	getStory(id: string): Promise<StoryMetaData> {
		return new Promise<StoryMetaData>((resolve, reject) => {
			let params = {
				storyId: id
			}
			this.http.get<StoryMetaData>('/api/stories_md', { params: params }).subscribe((data) => {
				resolve(<StoryMetaData>data)
			}, (error) => {
				reject(error)
			})
		})
	}
}