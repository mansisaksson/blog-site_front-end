import { Injectable } from '@angular/core'
import { StoryMetaData } from '../../_models'
import { CacheService, CacheManagementService } from './cache.service';

@Injectable()
export class StoryCacheService extends CacheService {
	constructor(protected cacheManagementService: CacheManagementService) {
		super('story_cache', 20, cacheManagementService)
	}

	public UpdateStoryCache(story: StoryMetaData[]) {
		story.forEach(story => {
			this.SetObjectCache(story.storyId, story, false)

			let chaperCacheService = this.cacheManagementService.GetCacheService('story_chapter_cache')
			story.chapters.forEach(chapter => {
				chaperCacheService.SetObjectCache(chapter.chapterId, chapter, false)
			})
			chaperCacheService.SaveCache()
		})
		this.SaveCache()
	}

	public InvalidateStoryCache(storyIds: string[]) {
		storyIds.forEach(storyId => {
			let story = this.GetCachedObjects()[storyId]
			if (story) {
				let chaperCacheService = this.cacheManagementService.GetCacheService('story_chapter_cache')
				story.chapters.forEach(chapter => {
					chaperCacheService.InvalidateObjectCache(chapter.chapterId, false)
				})
				chaperCacheService.SaveCache()
				this.InvalidateObjectCache(storyId, true)
			}
		})
	}

	public FindStoryCache(storyIds: string[]): { notFound: string[], foundStories: StoryMetaData[] } {
		this.ValidateCache()
		let result = { notFound: [], foundStories: [] }
		storyIds.forEach(storyId => {
			let story = this.GetCachedObjects()[storyId]
			if (story != undefined) {
				result.foundStories.push(story)
			} else {
				result.notFound.push(storyId)
			}
		})
		return result
	}
}