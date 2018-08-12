import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'

import { ChapterContent, StoryMetaData, ChapterMetaData, BackendResponse } from '../_models'
import { BehaviorSubject, Observable, Subject } from 'rxjs'
import { environment } from '../../environments/environment'
import { StoryCacheService } from './story-cache.service';

interface QueryCache {
	userId: string,
	queryString: string,
	resultIds: string[],
	cacheId: string
}

@Injectable()
export class StoryService {
	private currentStory: BehaviorSubject<StoryMetaData> = new BehaviorSubject<StoryMetaData>(undefined)
	private pendingRequests: { [url: string]: { [params: string]: Subject<any> } } = {}

	constructor(private http: HttpClient, private cacheService: StoryCacheService) {
	}

	setCurrentlyViewedStory(story: StoryMetaData) {
		this.currentStory.next(story)
	}

	getCurrentlyViewedStory(): Observable<StoryMetaData> {
		return this.currentStory.asObservable()
	}

	private getPendingRequest(url: string, params: any): Subject<any> {
		let requests = this.pendingRequests[url]
		if (requests != undefined) {
			let stringParams = JSON.stringify(params)
			let request = requests[stringParams]
			if (request != undefined) {
				console.log("Stopped Duplicate Request: " + url + " - " + stringParams)
				return request
			}
		}
		return undefined
	}

	private createPendingRequest(url: string, params: any) {
		console.log("Create request: " + url + " - " + JSON.stringify(params))
		let existinRequest = this.getPendingRequest(url, params)
		if (existinRequest != undefined) {
			throw "Overwriting existing request: " + url
		}

		let newSubject = new Subject()
		let stringParams = JSON.stringify(params)
		this.pendingRequests[url] = {}
		this.pendingRequests[url][stringParams] = newSubject

		return newSubject
	}

	private resolveRequest(url: string, params: any) {
		if (this.pendingRequests[url] != undefined) {
			console.log("Delete request: " + url + " - " + JSON.stringify(params))
			delete this.pendingRequests[url][JSON.stringify(params)]
		}
	}

	createStory(userId: string, title: string, chapter1Title: string): Promise<StoryMetaData> {
		return new Promise<StoryMetaData>((resolve, reject) => {
			let params = {
				userId: userId,
				title: title,
				chapter1Title: chapter1Title
			}
			this.http.post<BackendResponse>(environment.backendAddr + '/api/stories', {}, { params: params, withCredentials: true }).subscribe((data) => {
				let response = <BackendResponse>data
				if (response.success) {
					let story = <StoryMetaData>response.body
					this.cacheService.UpdateStoryCache([story])
					resolve(story)
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
			this.http.delete<BackendResponse>(environment.backendAddr + '/api/stories', { params: params, withCredentials: true }).subscribe((data) => {
				let response = <BackendResponse>data
				if (response.success) {
					this.cacheService.InvalidateStoryCache([id])
					resolve(response.body)
				} else {
					reject(response.error_code)
				}
			}, (error) => reject(error))
		})

	}

	getStories(userId?: string, searchQuery?: string): Promise<StoryMetaData[]> {
		return new Promise<StoryMetaData[]>((resolve, reject) => {
			let cachedIds = this.cacheService.FindQueryCache(userId ? userId : "", searchQuery ? searchQuery : "")
			if (cachedIds.length > 0) {
				let cache = this.cacheService.FindStoryCache(cachedIds)
				if (cache.notFound.length == 0) {
					return resolve(cache.foundStories)
				}
			}

			let params = {
				userId: userId ? userId.toString() : undefined,
				searchQuery: searchQuery
			}

			let request = this.getPendingRequest('/api/stories/query', params)
			if (request == undefined) {
				request =	this.createPendingRequest('/api/stories/query', params)
				this.http.get<BackendResponse>(environment.backendAddr + '/api/stories/query', { params: params }).subscribe((data) => {
					request.next(data)
					this.resolveRequest('/api/stories/query', params)
				})
			}
			request.subscribe((data) => {
				let response = <BackendResponse>data
				if (response.success) {
					let stories: StoryMetaData[] = <StoryMetaData[]>response.body
					this.cacheService.UpdateStoryCache(stories)
					let storyIds = stories.map(s => s.storyId)
					this.cacheService.UpdateQueryCache(userId, searchQuery, storyIds)
					resolve(stories)
				} else {
					reject(response.error_code)
				}
			}, (error) => reject(error))
		})
	}

	getStory(id: string): Promise<StoryMetaData> {
		return new Promise<StoryMetaData>((resolve, reject) => {
			let cachedStory = this.cacheService.FindStoryCache([id]).foundStories.find(s => { return s.storyId == id })
			if (cachedStory != undefined) {
				return resolve(cachedStory)
			}

			let params = {
				storyId: id
			}
			this.http.get<BackendResponse>(environment.backendAddr + '/api/stories', { params: params }).subscribe((data) => {
				let response = <BackendResponse>data
				if (response.success) {
					let story = <StoryMetaData>response.body
					this.cacheService.UpdateStoryCache([story])
					resolve(story)
				} else {
					reject(response.error_code)
				}
			}, (error) => reject(error))
		})
	}

	getStoryChapter(chapterId: string): Promise<ChapterMetaData> {
		return new Promise<ChapterMetaData>((resolve, reject) => {
			this.getChapters([chapterId]).then((data) => {
				resolve(data[0])
			}).catch((e) => reject(e))
		})
	}

	getChapterContent(uri: string): Promise<ChapterContent> {
		return new Promise<ChapterContent>((resolve, reject) => {
			this.getChapterContents([uri]).then((data) => {
				resolve(data[0])
			}).catch((e) => reject(e))
		})
	}

	updateStoryName(storyId: string, newTitle: string): Promise<StoryMetaData> {
		return new Promise<StoryMetaData>((resolve, reject) => {
			let params = {
				storyId: storyId
			}
			this.http.put<BackendResponse>(environment.backendAddr + '/api/stories/title', newTitle, { params: params, withCredentials: true }).subscribe((data) => {
				let response = <BackendResponse>data
				if (response.success) {
					let story = <StoryMetaData>response.body
					this.cacheService.UpdateStoryCache([story])
					resolve(story)
				} else {
					reject(response.error_code)
				}
			}, (error) => reject(error))
		})
	}

	// *** Chapters
	createChapter(storyId: string, chapterTitle: string): Promise<ChapterMetaData> {
		return new Promise<ChapterMetaData>((resolve, reject) => {
			let params = {
				storyId: storyId,
				chapterTitle: chapterTitle,
			}
			this.http.post<BackendResponse>(environment.backendAddr + '/api/stories/chapters', {}, { params: params, withCredentials: true }).subscribe((data) => {
				let response = <BackendResponse>data
				if (response.success) {
					let chapter = <ChapterMetaData>response.body
					this.cacheService.UpdateChapterCache([chapter])
					resolve(chapter)
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
			this.http.delete<BackendResponse>(environment.backendAddr + '/api/stories/chapters', { params: params, withCredentials: true }).subscribe((data) => {
				let response = <BackendResponse>data
				if (response.success) {
					this.cacheService.InvalidateChapterCache([chapterId])
					let story = <StoryMetaData>response.body
					this.cacheService.UpdateStoryCache([story])
					resolve(story)
				} else {
					reject(response.error_code)
				}
			}, (error) => reject(error))
		})
	}

	getChapters(chaptersIds: string[]): Promise<ChapterMetaData[]> {
		return new Promise<ChapterMetaData[]>((resolve, reject) => {
			let cache = this.cacheService.FindChapterCache(chaptersIds)
			if (cache.notFound.length == 0) {
				return resolve(cache.foundChapters)
			}

			let params = {
				chapterIds: JSON.stringify(cache.notFound)
			}
			this.http.get<BackendResponse>(environment.backendAddr + '/api/stories/chapters', { params: params }).subscribe((data) => {
				let response = <BackendResponse>data
				if (response.success) {
					let chapters = <ChapterMetaData[]>response.body
					this.cacheService.UpdateChapterCache(chapters)
					chapters.concat(cache.foundChapters)
					resolve(chapters)
				} else {
					reject(response.error_code)
				}
			}, (error) => reject(error))
		})
	}

	getChapterContents(contentURIs: string[]): Promise<ChapterContent[]> {
		return new Promise<ChapterContent[]>((resolve, reject) => {
			let cache = this.cacheService.FindChapterContentCache(contentURIs)
			if (cache.notFound.length == 0) {
				return resolve(cache.foundContents)
			}

			let params = {
				contentURIs: JSON.stringify(contentURIs)
			}
			this.http.get<BackendResponse>(environment.backendAddr + '/api/stories/chapters/content', { params: params }).subscribe((data) => {
				let response = <BackendResponse>data
				if (response.success) {
					let contents = <ChapterContent[]>response.body
					this.cacheService.UpdateChapterContentCache(contents)
					contents.concat(cache.foundContents)
					resolve(contents)
				} else {
					reject(response.error_code)
				}
			}, (error) => reject(error))
		})
	}

	updateChapterContent(chapterId: string, content: string): Promise<any> {
		return new Promise<any>((resolve, reject) => {
			let params = {
				chapterId: chapterId
			}
			this.http.put<BackendResponse>(environment.backendAddr + '/api/stories/chapters/content', content, { params: params, withCredentials: true }).subscribe((data) => {
				let response = <BackendResponse>data
				if (response.success) {
					let URI = response.body.URI
					this.cacheService.UpdateChapterContentCache([{ URI: URI, content: content }])
					resolve()
				} else {
					reject(response.error_code)
				}
			}, (error) => reject(error))
		})
	}

	updateChapterMetaData(chapterId: string, newMetaData: ChapterMetaData): Promise<ChapterMetaData> {
		return new Promise<ChapterMetaData>((resolve, reject) => {
			let params = {
				chapterId: chapterId
			}
			this.http.put<BackendResponse>(environment.backendAddr + '/api/stories/chapters', JSON.stringify(newMetaData), { params: params, withCredentials: true }).subscribe((data) => {
				let response = <BackendResponse>data
				if (response.success) {
					let chapter = <ChapterMetaData>response.body
					this.cacheService.UpdateChapterCache([chapter])
					resolve(chapter)
				} else {
					reject(response.error_code)
				}
			}, (error) => reject(error))
		})
	}
}