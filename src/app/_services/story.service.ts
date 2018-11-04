import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'

import { ChapterContent, StoryMetaData, ChapterMetaData, BackendResponse } from '../_models'
import { BehaviorSubject, Observable } from 'rxjs'
import { environment } from '../../environments/environment'
import { StoryCacheService, ChapterCacheService, ChapterContentCacheService, StoryQueryCacheService } from './caching_services'

@Injectable()
export class StoryService {
	private currentStory: BehaviorSubject<StoryMetaData> = new BehaviorSubject<StoryMetaData>(undefined)

	constructor(
		private http: HttpClient, 
		private storyCacheService: StoryCacheService,
		private chapterCacheService: ChapterCacheService, 
		private chapterContentCacheService: ChapterContentCacheService, 
		private storyQueryCacheService: StoryQueryCacheService) {
	}

	setCurrentlyViewedStory(story: StoryMetaData) {
		this.currentStory.next(story)
	}

	getCurrentlyViewedStory(): Observable<StoryMetaData> {
		return this.currentStory.asObservable()
	}

	createStory(userId: string, title: string, chapter1Title: string): Promise<StoryMetaData> {
		return new Promise<StoryMetaData>((resolve, reject) => {
			let params = {
				userId: userId
			}
			let body = {
				title: title,
				chapter1Title: chapter1Title
			}
			this.http.post<BackendResponse>(environment.backendAddr + '/api/stories', JSON.stringify(body), { 
				headers: { 'Content-Type': 'application/json' },
				params: params,
				responseType: "json",
				withCredentials: true
			}).subscribe((response: BackendResponse) => {
				if (response.success) {
					let story = <StoryMetaData>response.body
					this.storyCacheService.UpdateStoryCache([story])
					resolve(story)
				} else {
					reject(response.error_code)
				}
			}, (error) => reject(error))
		})
	}

	updateStory(storyId: string, newStoryProperties: object): Promise<StoryMetaData> {
		return new Promise<StoryMetaData>((resolve, reject) => {
			let params = {
				storyId: storyId
			}
			this.http.put<BackendResponse>(environment.backendAddr + '/api/stories', JSON.stringify(newStoryProperties), { 
				headers: { 'Content-Type': 'application/json' },
				params: params,
				responseType: "json",
				withCredentials: true
			}).subscribe((response: BackendResponse) => {
				if (response.success) {
					let story = <StoryMetaData>response.body
					this.storyCacheService.UpdateStoryCache([story])
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
			this.http.delete<BackendResponse>(environment.backendAddr + '/api/stories', { 
				headers: { 'Content-Type': 'application/json' },
				params: params,
				responseType: "json",
				withCredentials: true
			}).subscribe((response: BackendResponse) => {
				if (response.success) {
					this.storyCacheService.InvalidateStoryCache([id])
					resolve(response.body)
				} else {
					reject(response.error_code)
				}
			}, (error) => reject(error))
		})

	}

	getStories(userId?: string, searchQuery?: string): Promise<StoryMetaData[]> {
		return new Promise<StoryMetaData[]>((resolve, reject) => {
			let cachedIds = this.storyQueryCacheService.FindQueryCache(userId ? userId : "", searchQuery ? searchQuery : "")
			if (cachedIds.length > 0) {
				let cache = this.storyCacheService.FindStoryCache(cachedIds)
				if (cache.notFound.length == 0) {
					return resolve(cache.foundStories)
				}
			}

			let params = {
				userId: userId ? userId.toString() : undefined,
				searchQuery: searchQuery
			}

			this.http.get<BackendResponse>(environment.backendAddr + '/api/stories/query', { 
				headers: { 'Content-Type': 'application/json' },
				params: params,
				responseType: "json",
				withCredentials: true
			}).subscribe((response: BackendResponse) => {
				if (response.success) {
					let stories: StoryMetaData[] = <StoryMetaData[]>response.body
					this.storyCacheService.UpdateStoryCache(stories)
					let storyIds = stories.map(s => s.storyId)
					this.storyQueryCacheService.UpdateQueryCache(userId, searchQuery, storyIds)
					resolve(stories)
				} else {
					reject(response.error_code)
				}
			}, (error) => reject(error))
		})
	}

	getStory(id: string): Promise<StoryMetaData> {
		return new Promise<StoryMetaData>((resolve, reject) => {
			let cachedStory = this.storyCacheService.FindStoryCache([id]).foundStories.find(s => { return s.storyId == id })
			if (cachedStory != undefined) {
				return resolve(cachedStory)
			}

			let params = {
				storyId: id
			}
			this.http.get<BackendResponse>(environment.backendAddr + '/api/stories', { 
				headers: { 'Content-Type': 'application/json' },
				params: params,
				responseType: "json",
				withCredentials: true
			}).subscribe((response: BackendResponse) => {
				if (response.success) {
					let story = <StoryMetaData>response.body
					this.storyCacheService.UpdateStoryCache([story])
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

	// *** Chapters
	createChapter(storyId: string, chapterTitle: string): Promise<ChapterMetaData> {
		return new Promise<ChapterMetaData>((resolve, reject) => {
			let params = {
				storyId: storyId
			}
			let body = {
				title: chapterTitle
			}
			this.http.post<BackendResponse>(environment.backendAddr + '/api/stories/chapters', JSON.stringify(body), { 
				headers: { 'Content-Type': 'application/json' },
				params: params,
				responseType: "json",
				withCredentials: true
			}).subscribe((response: BackendResponse) => {
				if (response.success) {
					let chapter = <ChapterMetaData>response.body
					this.chapterCacheService.UpdateChapterCache([chapter])
					resolve(chapter)
				} else {
					reject(response.error_code)
				}
			}, (error) => reject(error))
		})
	}

	updateChapter(chapterId: string, newChapterProperties: object): Promise<ChapterMetaData> {
		return new Promise<ChapterMetaData>((resolve, reject) => {
			let params = {
				chapterId: chapterId
			}
			this.http.put<BackendResponse>(environment.backendAddr + '/api/stories/chapters', JSON.stringify(newChapterProperties), {
				headers: { 'Content-Type': 'application/json' },
				params: params,
				responseType: "json",
				withCredentials: true
			}).subscribe((response: BackendResponse) => {
				if (response.success) {
					let chapter = <ChapterMetaData>response.body
					this.chapterCacheService.UpdateChapterCache([chapter])
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
				chapterId: chapterId
			}
			this.http.delete<BackendResponse>(environment.backendAddr + '/api/stories/chapters', { 
				headers: { 'Content-Type': 'application/json' },
				params: params,
				responseType: "json",
				withCredentials: true
			}).subscribe((response: BackendResponse) => {
				if (response.success) {
					this.chapterCacheService.InvalidateChapterCache([chapterId])
					let story = <StoryMetaData>response.body
					this.storyCacheService.UpdateStoryCache([story])
					resolve(story)
				} else {
					reject(response.error_code)
				}
			}, (error) => reject(error))
		})
	}

	getChapters(chaptersIds: string[]): Promise<ChapterMetaData[]> {
		return new Promise<ChapterMetaData[]>((resolve, reject) => {
			let cache = this.chapterCacheService.FindChapterCache(chaptersIds)
			if (cache.notFound.length == 0) {
				return resolve(cache.foundChapters)
			}

			let params = {
				chapterIds: cache.notFound
			}
			this.http.get<BackendResponse>(environment.backendAddr + '/api/stories/chapters', { 
				headers: { 'Content-Type': 'application/json' },
				params: params,
				responseType: "json",
				withCredentials: true
			}).subscribe((response) => {
				if (response.success) {
					let chapters = <ChapterMetaData[]>response.body
					this.chapterCacheService.UpdateChapterCache(chapters)
					chapters.concat(cache.foundChapters)
					resolve(chapters)
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
			let body = {
				content: content
			}
			this.http.put<BackendResponse>(environment.backendAddr + '/api/stories/chapters/content', JSON.stringify(body), {
				headers: { 'Content-Type': 'application/json' },
				params: params,
				responseType: "json",
				withCredentials: true
			}).subscribe((response: BackendResponse) => {
				if (response.success) {
					let URI = response.body.URI
					this.chapterContentCacheService.UpdateChapterContentCache([{ URI: URI, content: content }])
					resolve()
				} else {
					reject(response.error_code)
				}
			}, (error) => reject(error))
		})
	}

	getChapterContents(contentURIs: string[]): Promise<ChapterContent[]> {
		return new Promise<ChapterContent[]>((resolve, reject) => {
			let cache = this.chapterContentCacheService.FindChapterContentCache(contentURIs)
			if (cache.notFound.length == 0) {
				return resolve(cache.foundContents)
			}

			let params = {
				contentURIs: contentURIs
			}
			this.http.get<BackendResponse>(environment.backendAddr + '/api/stories/chapters/content', {
				headers: { 'Content-Type': 'application/json' },
				params: params,
				responseType: "json",
				withCredentials: true
			}).subscribe((response: BackendResponse) => {
				if (response.success) {
					let contents = <ChapterContent[]>response.body
					this.chapterContentCacheService.UpdateChapterContentCache(contents)
					contents.concat(cache.foundContents)
					resolve(contents)
				} else {
					reject(response.error_code)
				}
			}, (error) => reject(error))
		})
	}

}