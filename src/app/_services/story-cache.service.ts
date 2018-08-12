import { Injectable } from '@angular/core'
import { ChapterContent, StoryMetaData, ChapterMetaData } from '../_models'
import { environment } from '../../environments/environment'

interface QueryCache {
	userId: string,
	queryString: string,
	resultIds: string[],
	cacheId: string
}

@Injectable()
export class StoryCacheService {
	private storyCache: { [key: string]: StoryMetaData } = {}
	private chapterCache: { [key: string]: ChapterMetaData } = {}
	private chapterContentCache: { [key: string]: ChapterContent } = {}
	private queryCache: QueryCache[] = []
	private cacheTimeStamp: { [key: string]: number } = {}

	private TimeToInvalidate = 10

	constructor() {
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
	public UpdateQueryCache(userId: string, queryString: string, storyIds: string[]) {
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

	public FindQueryCache(userId: string, queryString: string): string[] {
		this.ValidateCache()
		let cacheIndex = this.queryCache.findIndex(q => { return q.userId == userId && q.queryString == queryString })
		if (cacheIndex != -1) {
			return this.queryCache[cacheIndex].resultIds
		}
		return []
	}
	// *** End Query Cache Interface

	// *** Begin Story Cache Interface
	public UpdateStoryCache(story: StoryMetaData[]) {
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

	public InvalidateStoryCache(storyIds: string[]) {
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

	public FindStoryCache(storyIds: string[]): { notFound: string[], foundStories: StoryMetaData[] } {
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
	public UpdateChapterCache(chapters: ChapterMetaData[]) {
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

	public InvalidateChapterCache(chapterIds: string[]) {
		chapterIds.forEach(chapterId => {
			delete this.chapterCache[chapterId]
		})
		this.SaveStoryCache()
	}

	public FindChapterCache(chapterIds: string[]): { notFound: string[], foundChapters: ChapterMetaData[] } {
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
	public UpdateChapterContentCache(contents: ChapterContent[]) {
		contents.forEach(content => {
			this.chapterContentCache[content.URI] = content
			this.TimeStampId(content.URI)
		})
		this.SaveStoryCache()
	}

	public InvalidateChapterContentCache(contentURIs: string[]) {
		contentURIs.forEach(uri => {
			delete this.chapterContentCache[uri]
		})
		this.SaveStoryCache()
	}

	public FindChapterContentCache(contentURIs: string[]): { notFound: string[], foundContents: ChapterContent[] } {
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

}