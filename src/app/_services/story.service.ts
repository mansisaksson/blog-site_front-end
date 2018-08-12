import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'

import { ChapterContent, StoryMetaData, ChapterMetaData, BackendResponse } from '../_models'
import { BehaviorSubject, Observable } from 'rxjs'
import { environment } from '../../environments/environment'

interface QueryCache {
	userId: string,
	queryString: string,
	resultIds: string[],
	cacheId: string
}

@Injectable()
export class StoryService {
	private currentStory: BehaviorSubject<StoryMetaData> = new BehaviorSubject<StoryMetaData>(undefined)
	private storyCache: { [key: string]: StoryMetaData } = {}
	private chapterCache: { [key: string]: ChapterMetaData } = {}
	private chapterContentCache: { [key: string]: ChapterContent } = {}
	private queryCache: QueryCache[] = []
	private cacheTimeStamp: { [key: string]: number } = {}

	private TimeToInvalidate = 30

	constructor(private http: HttpClient) {
		this.LoadStoryCache()
	}

	private LoadStoryCache() {
		let storyCache = JSON.parse(localStorage.getItem('story_cache'))
		if (storyCache) {
			this.storyCache = storyCache
		}
		let chapterCache = JSON.parse(localStorage.getItem('story_chapter_cache'))
		if (chapterCache) {
			this.chapterCache = chapterCache
		}
		let chapterContentCache = JSON.parse(localStorage.getItem('story_chapter_content_cache'))
		if (chapterContentCache) {
			this.chapterContentCache = chapterContentCache
		}
		let queryCache = JSON.parse(localStorage.getItem('story_query_cache'))
		if (queryCache) {
			this.queryCache = queryCache
		}
		let cacheTimeStamp = JSON.parse(localStorage.getItem('story_cache_timestamps'))
		if (cacheTimeStamp) {
			this.cacheTimeStamp = cacheTimeStamp
		}
	}

	private SaveStoryCache() {
		localStorage.setItem('story_cache', JSON.stringify(this.storyCache))
		localStorage.setItem('story_chapter_cache', JSON.stringify(this.chapterCache))
		localStorage.setItem('story_chapter_content_cache', JSON.stringify(this.chapterContentCache))
		localStorage.setItem('story_cache_timestamps', JSON.stringify(this.cacheTimeStamp))
		localStorage.setItem('story_query_cache', JSON.stringify(this.queryCache))
	}

	private ValidateCache() {
		Object.keys(this.cacheTimeStamp).forEach(id => {
			let cacheAge = Date.now() - this.cacheTimeStamp[id]
			if (cacheAge > this.TimeToInvalidate * 1000) {
				delete this.storyCache[id]
				delete this.chapterCache[id]
				delete this.chapterContentCache[id]
				let index = this.queryCache.findIndex(q => { return q.cacheId == id })
				if (index != -1) {
					this.queryCache.splice(index)
				}
				delete this.cacheTimeStamp[id]
				this.SaveStoryCache()
			}
		})
	}

	private TimeStampId(id: string) {
		this.cacheTimeStamp[id] = Date.now()
	}

	// *** Begin Query Cache Interface
	private UpdateQueryCache(userId: string, queryString: string, storyIds: string[]) {
			function createGuid() {
			function s4() {
				return Math.floor((1 + Math.random()) * 0x10000)
					.toString(16)
					.substring(1);
			}
			return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
		}

		let defUserId = userId ? userId : ""
		let defQueryString = queryString ? queryString : ""
		let cacheIndex = this.queryCache.findIndex(q => { return q.userId == defUserId && q.queryString == defQueryString })
		let newCache = <QueryCache>{
			userId: defUserId,
			queryString: defQueryString,
			resultIds: storyIds,
			cacheId: cacheIndex != -1 ? this.queryCache[cacheIndex].cacheId : createGuid()
		}

		if (cacheIndex == -1) {
			this.queryCache.push(newCache)
		} else {
			this.queryCache[cacheIndex] = newCache
		}
		this.TimeStampId(newCache.cacheId)
		this.SaveStoryCache()
	}

	private FindQueryCache(userId: string, queryString: string): string[] {
		this.ValidateCache()
		let cacheIndex = this.queryCache.findIndex(q => { return q.userId == userId && q.queryString == queryString })
		if (cacheIndex != -1) {
			return this.queryCache[cacheIndex].resultIds
		}
		return []
	}
	// *** End Query Cache Interface

	// *** Begin Story Cache Interface
	private UpdateStoryCache(story: StoryMetaData[]) {
		story.forEach(story => {
			this.storyCache[story.storyId] = story
			this.TimeStampId(story.storyId)
			story.chapters.forEach(chapter => {
				this.chapterCache[chapter.chapterId] = chapter
				this.TimeStampId(chapter.chapterId)
			})
		})
		this.SaveStoryCache()
	}

	private InvalidateStoryCache(storyIds: string[]) {
		storyIds.forEach(storyId => {
			let story = this.storyCache[storyId]
			if (story) {
				story.chapters.forEach(chapter => {
					delete this.chapterCache[chapter.chapterId]
				})
				delete this.storyCache[storyId]
			}
		})
		this.SaveStoryCache()
	}

	private FindStoryCache(storyIds: string[]): { notFound: string[], foundStories: StoryMetaData[] } {
		this.ValidateCache()
		let result = { notFound: [], foundStories: [] }
		storyIds.forEach(storyId => {
			let story = this.storyCache[storyId]
			if (story != undefined) {
				result.foundStories.push(story)
			} else {
				result.notFound.push(storyId)
			}
		})
		return result
	}
	// *** End Story Cache Interface

	// *** Begin Chapter Cache
	private UpdateChapterCache(chapters: ChapterMetaData[]) {
		chapters.forEach(chapter => {
			this.chapterCache[chapter.chapterId] = chapter
			this.TimeStampId(chapter.chapterId)
			let story = this.storyCache[chapter.storyId]
			if (story) {
				let index = story.chapters.findIndex(c => { return c.chapterId == chapter.chapterId })
				if (index != -1) {
					story.chapters[index] = chapter
				} else {
					story.chapters.push(chapter)
				}
				this.storyCache[story.storyId] = story
			}
		})
		this.SaveStoryCache()
	}

	private InvalidateChapterCache(chapterIds: string[]) {
		chapterIds.forEach(chapterId => {
			delete this.chapterCache[chapterId]
		})
		this.SaveStoryCache()
	}

	private FindChapterCache(chapterIds: string[]): { notFound: string[], foundChapters: ChapterMetaData[] } {
		this.ValidateCache()
		let result = { notFound: [], foundChapters: [] }
		chapterIds.forEach(chapterId => {
			let chapter = this.chapterCache[chapterId]
			if (chapter != undefined) {
				result.foundChapters.push(chapter)
			} else {
				result.notFound.push(chapterId)
			}
		})
		return result
	}
	// *** End Chapter Cache

	// *** Begin Chapter Content Cache
	private UpdateChapterContentCache(contents: ChapterContent[]) {
		contents.forEach(content => {
			this.chapterContentCache[content.URI] = content
			this.TimeStampId(content.URI)
		})
		this.SaveStoryCache()
	}

	private InvalidateChapterContentCache(contentURIs: string[]) {
		contentURIs.forEach(uri => {
			delete this.chapterContentCache[uri]
		})
		this.SaveStoryCache()
	}

	private FindChapterContentCache(contentURIs: string[]): { notFound: string[], foundContents: ChapterContent[] } {
		this.ValidateCache()
		let result = { notFound: [], foundContents: [] }
		contentURIs.forEach(uri => {
			let content = this.chapterContentCache[uri]
			if (content != undefined) {
				result.foundContents.push(content)
			} else {
				result.notFound.push(uri)
			}
		})
		return result
	}
	// *** End Chapter Content Cache

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
			this.http.post<BackendResponse>(environment.backendAddr + '/api/stories', {}, { params: params, withCredentials: true }).subscribe((data) => {
				let response = <BackendResponse>data
				if (response.success) {
					let story = <StoryMetaData>response.body
					this.UpdateStoryCache([story])
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
					this.InvalidateStoryCache([id])
					resolve(response.body)
				} else {
					reject(response.error_code)
				}
			}, (error) => reject(error))
		})

	}

	getStories(userId?: string, searchQuery?: string): Promise<StoryMetaData[]> {
		return new Promise<StoryMetaData[]>((resolve, reject) => {
			let cachedIds = this.FindQueryCache(userId ? userId : "", searchQuery ? searchQuery : "")
			if (cachedIds.length > 0) {
				let cache = this.FindStoryCache(cachedIds)
				if (cache.notFound.length == 0) {
					return resolve(cache.foundStories)
				}
			}

			let params = {
				userId: userId ? userId.toString() : undefined,
				searchQuery: searchQuery
			}

			this.http.get<BackendResponse>(environment.backendAddr + '/api/stories/query', { params: params }).subscribe((data) => {
				let response = <BackendResponse>data
				if (response.success) {
					let stories: StoryMetaData[] = <StoryMetaData[]>response.body
					this.UpdateStoryCache(stories)
					let storyIds = stories.map(s => s.storyId)
					this.UpdateQueryCache(userId, searchQuery, storyIds)
					resolve(stories)
				} else {
					reject(response.error_code)
				}
			}, (error) => reject(error))
		})
	}

	getStory(id: string): Promise<StoryMetaData> {
		return new Promise<StoryMetaData>((resolve, reject) => {
			let cachedStory = this.FindStoryCache([id]).foundStories.find(s => { return s.storyId == id })
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
					this.UpdateStoryCache([story])
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
					this.UpdateStoryCache([story])
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
					this.UpdateChapterCache([chapter])
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
					this.InvalidateChapterCache([chapterId])
					let story = <StoryMetaData>response.body
					this.UpdateStoryCache([story])
					resolve(story)
				} else {
					reject(response.error_code)
				}
			}, (error) => reject(error))
		})
	}

	getChapters(chaptersIds: string[]): Promise<ChapterMetaData[]> {
		return new Promise<ChapterMetaData[]>((resolve, reject) => {
			let cache = this.FindChapterCache(chaptersIds)
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
					this.UpdateChapterCache(chapters)
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
			let cache = this.FindChapterContentCache(contentURIs)
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
					this.UpdateChapterContentCache(contents)
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
					this.UpdateChapterContentCache([{ URI: URI, content: content }])
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
					this.UpdateChapterCache([chapter])
					resolve(chapter)
				} else {
					reject(response.error_code)
				}
			}, (error) => reject(error))
		})
	}
}