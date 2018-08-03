import { Injectable } from '@angular/core'
import { HttpClient, HttpParams } from '@angular/common/http'

import { StoryChapter, StoryMetaData, ChapterMetaData, BackendResponse } from '../_models'
import { BehaviorSubject, Observable } from 'rxjs'
import { environment } from '../../environments/environment'

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
			this.http.post<BackendResponse>(environment.backendAddr + '/api/stories', {}, { params: params }).subscribe((data) => {
				let response = <BackendResponse>data
				if (response.success) {
					resolve(<StoryMetaData>response.body)
				} else {
					reject(response.error_code)
				}
			}, (error) => reject(error))
		})
	}

	deleteStory(id: string): Promise<any> {
		return new Promise<any>((resolve, reject) => {
			let params = {
				storyId: id
			}
			this.http.delete<BackendResponse>(environment.backendAddr + '/api/stories', { params: params }).subscribe((data) => {
				let response = <BackendResponse>data
				if (response.success) {
					resolve(response.body)
				} else {
					reject(response.error_code)
				}
			}, (error) => reject(error))
		})

	}

	getStories(userId?: string, searchQuery?: string): Promise<StoryMetaData[]> {
		return new Promise<StoryMetaData[]>((resolve, reject) => {
			let params = {
				userId: userId ? userId.toString() : undefined,
				searchQuery: searchQuery
			}

			this.http.get<BackendResponse>(environment.backendAddr + '/api/stories/query', { params: params }).subscribe((data) => {
				let response = <BackendResponse>data
				if (response.success) {
					resolve(response.body)
				} else {
					reject(response.error_code)
				}
			}, (error) => reject(error))
		})
	}

	getStory(id: string): Promise<StoryMetaData> {
		return new Promise<StoryMetaData>((resolve, reject) => {
			let params = {
				storyId: id
			}
			this.http.get<BackendResponse>(environment.backendAddr + '/api/stories', { params: params }).subscribe((data) => {
				let response = <BackendResponse>data
				if (response.success) {
					resolve(<StoryMetaData>response.body)
				} else {
					reject(response.error_code)
				}
			}, (error) => reject(error))
		})
	}

	getStoryChapter(chapterId: string): Promise<StoryChapter> {
		return new Promise<StoryChapter>((resolve, reject) => {
			let idArray = [chapterId]
			this.getChapters(idArray).then((data) => {
				resolve(data[0])
			}).catch((e) => reject(e))
		})
	}

	updateStoryName(stortId: string, newTitle: string): Promise<StoryMetaData> {
		return new Promise<StoryMetaData>((resolve, reject) => {
			let params = {
				storyId: stortId
			}
			this.http.put<BackendResponse>(environment.backendAddr + '/api/stories/title', newTitle, { params: params }).subscribe((data) => {
				let response = <BackendResponse>data
				if (response.success) {
					resolve(<StoryMetaData>response.body)
				} else {
					reject(response.error_code)
				}
			}, (error) => reject(error))
		})
	}

	// *** Chapters
	createChapter(storyId: string, chapterTitle: string): Promise<StoryMetaData> {
		return new Promise<StoryMetaData>((resolve, reject) => {
			let params = {
				storyId: storyId,
				chapterTitle: chapterTitle,
			}
			this.http.post<BackendResponse>(environment.backendAddr + '/api/stories/chapters', {}, { params: params }).subscribe((data) => {
				let response = <BackendResponse>data
				if (response.success) {
					resolve(<StoryMetaData>response.body)
				} else {
					reject(response.error_code)
				}
			}, (error) => reject(error))
		})
	}

	deleteChapter(chapterId: string): Promise<StoryMetaData> {
		return new Promise<StoryMetaData>((resolve, reject) => {
			let params = {
				chapterId: chapterId,
			}
			this.http.delete<BackendResponse>(environment.backendAddr + '/api/stories/chapters', { params: params }).subscribe((data) => {
				let response = <BackendResponse>data
				if (response.success) {
					resolve(<StoryMetaData>response.body)
				} else {
					reject(response.error_code)
				}
			}, (error) => reject(error))
		})
	}

	getChapters(chaptersIds: string[]): Promise<StoryChapter[]> {
		return new Promise<StoryChapter[]>((resolve, reject) => {
			let params = {
				chapterIds: JSON.stringify(chaptersIds)
			}
			this.http.get<BackendResponse>(environment.backendAddr + '/api/stories/chapters', { params: params }).subscribe((data) => {
				let response = <BackendResponse>data
				if (response.success) {
					resolve(<StoryChapter[]>response.body)
				} else {
					reject(response.error_code)
				}
			}, (error) => reject(error))
		})
	}

	updateChapterContent(chapterId, chapterCntent: string): Promise<any> {
		return new Promise<any>((resolve, reject) => {
			let params = {
				chapterId: chapterId
			}
			this.http.put<BackendResponse>(environment.backendAddr + '/api/stories/chapters/content', chapterCntent, { params: params }).subscribe((data) => {
				let response = <BackendResponse>data
				if (response.success) {
					resolve(response.body)
				} else {
					reject(response.error_code)
				}
			}, (error) => reject(error))
		})
	}

	updateChapterMetaData(chapterId: string, newMetaData: ChapterMetaData): Promise<StoryMetaData> {
		return new Promise<StoryMetaData>((resolve, reject) => {
			let params = {
				chapterId: chapterId
			}
			this.http.put<BackendResponse>(environment.backendAddr + '/api/stories/chapters/metaData', newMetaData, { params: params }).subscribe((data) => {
				let response = <BackendResponse>data
				if (response.success) {
					resolve(<StoryMetaData>response.body)
				} else {
					reject(response.error_code)
				}
			}, (error) => reject(error))
		})
	}
}