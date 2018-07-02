import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { StoryChapter, StoryMetaData, ChapterMetaData } from '../_models/index';
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

			this.http.get<StoryMetaData[]>('/api/stories/query', { params: params }).subscribe((data) => {
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
			this.http.get<StoryMetaData>('/api/stories', { params: params }).subscribe((data) => {
				resolve(<StoryMetaData>data)
			}, (error) => {
				reject(error)
			})
		})
	}

	getStoryChapter(chapterURI: string): Promise<StoryChapter> {
		return new Promise<StoryChapter>((resolve, reject) => {
			let uriArray = [chapterURI]
			this.getChapters(uriArray).then((data) => {
				resolve(data[0])
			}).catch((e) => {
				reject(e)
			})
		})
	}

	// *** Chapters
	createChapter(storyId: string, chapterTitle: string): Promise<StoryMetaData> {
		return new Promise<StoryMetaData>((resolve, reject) => {
			let params = {
				storyId: storyId,
				chapterTitle: chapterTitle,
			}
			this.http.post('/api/stories/chapters', {}, { params: params }).subscribe((data) => {
				resolve(<StoryMetaData>data)
			}, (error) => {
				reject(error)
			})
		})
	}

	deleteChapter(chapterURI: string): Promise<StoryMetaData> {
		return new Promise<StoryMetaData>((resolve, reject) => {
			let params = {
				uri: chapterURI,
			}
			this.http.delete('/api/stories/chapters', { params: params }).subscribe((data) => {
				resolve(<StoryMetaData>data)
			}, (error) => {
				reject(error)
			})
		})
	}

	getChapters(chaptersURIs: string[]): Promise<StoryChapter[]> {
		return new Promise<StoryChapter[]>((resolve, reject) => {
			let params = {
				URIs: JSON.stringify(chaptersURIs)
			}
			this.http.get('/api/stories/chapters', { params: params }).subscribe((data) => {
				resolve(<StoryChapter[]>data)
			}, (error) => {
				reject(error)
			})
		})
	}

	updateChapterContent(uri, chapterCntent: string): Promise<boolean> {
		return new Promise<boolean>((resolve, reject) => {
			let params = {
				uri: uri
			}
			this.http.put('/api/stories/chapters/content', chapterCntent, { params: params }).subscribe((data) => {
				resolve(<boolean>data)
			}, (error) => {
				reject(error)
			})
		})
	}

	updateChapterMetaData(uri: string, newMetaData: ChapterMetaData): Promise<StoryMetaData> {
		return new Promise<StoryMetaData>((resolve, reject) => {
			let params = {
				uri: uri
			}
			this.http.put('/api/stories/chapters/metaData', newMetaData, { params: params }).subscribe((data) => {
				resolve(<StoryMetaData>data)
			}, (error) => {
				reject(error)
			})
		})
	}
}