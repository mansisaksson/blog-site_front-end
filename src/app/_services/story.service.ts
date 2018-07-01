import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { StoryChapter, StoryMetaData } from '../_models/index';
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

	getStoryChapter(chapterURI: string): Promise<StoryChapter> {
		return new Promise<StoryChapter>((resolve, reject) => {
			let uriArray = [chapterURI]

			this.getStoryChapters(uriArray).then((data) => {
				resolve(data[0])
			}).catch((e) => {
				reject(e)
			})
		})
	}

	getStoryChapters(chaptersURIs: string[]): Promise<StoryChapter[]> {
		return new Promise<StoryChapter[]>((resolve, reject) => {
			let params = {
				URIs: JSON.stringify(chaptersURIs)
			}
			this.http.get('/api/stories', { params: params }).subscribe((data) => {
				resolve(<StoryChapter[]>data)
			}, (error) => {
				reject(error)
			})
		})
	}

	createStory(userId: string, title: string, chapter1Title: string): Promise<StoryMetaData> {
		return new Promise<StoryMetaData>((resolve, reject) => {
			let params = {
				userId: userId,
				title: title,
				chapter1Title: chapter1Title
			}
			this.http.post('/api/stories', {}, { params: params }).subscribe((data) => {
				resolve(<StoryMetaData>data)
			}, (error) => {
				reject(error)
			})
		})
	}

	updateStoryChapter(storyChapter: StoryChapter): Promise<boolean> {
		return new Promise<boolean>((resolve, reject) => {
			let params = {
				uri: storyChapter.metaData.URI
			}
			this.http.put('/api/stories', storyChapter, { params: params }).subscribe((data) => {
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