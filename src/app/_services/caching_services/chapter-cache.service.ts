import { Injectable } from '@angular/core'
import { CacheService, CacheManagementService } from './cache.service'
import { ChapterMetaData } from '../../_models'

@Injectable()
export class ChapterCacheService extends CacheService {
	constructor(protected cacheManagementService: CacheManagementService) {
		super('story_chapter_cache', 20, cacheManagementService)
	}

	public UpdateChapterCache(chapters: ChapterMetaData[]) {
		chapters.forEach(chapter => {
			// Update Chapter cache
			this.SetObjectCache(chapter.chapterId, chapter, true)
			
			// Update story cache
			let storyCache = this.cacheManagementService.GetCacheService('story_cache')
			let story = storyCache.GetCachedObjects()[chapter.storyId]
			if (story) {
				let index = story.chapters.findIndex(c => c.chapterId == chapter.chapterId)
				if (index != -1) {
					story.chapters[index] = chapter
				} else {
					story.chapters.push(chapter)
				}
				storyCache.SetObjectCache(story.storyId, story, true)
			}
		})
	}

	public InvalidateChapterCache(chapterIds: string[]) {
		chapterIds.forEach(chapterId => {
			this.InvalidateObjectCache(chapterId, false)
		})
		this.SaveCache()
	}

	public FindChapterCache(chapterIds: string[]): { notFound: string[], foundChapters: ChapterMetaData[] } {
		this.ValidateCache()
		let result = { notFound: [], foundChapters: [] }
		chapterIds.forEach(chapterId => {
			let chapter = this.GetCachedObjects()[chapterId]
			if (chapter != undefined) {
				result.foundChapters.push(chapter)
			} else {
				result.notFound.push(chapterId)
			}
		})
		return result
	}
}