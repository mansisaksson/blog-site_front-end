import { Injectable } from '@angular/core'
import { CacheService, CacheManagementService } from './cache.service'
import { ChapterMetaData } from '../../_models'

@Injectable()
export class ChapterCacheService extends CacheService {
	constructor(protected cacheManagementService: CacheManagementService) {
		super('blog_chapter_cache', 20, cacheManagementService)
	}

	public UpdateChapterCache(chapters: ChapterMetaData[]) {
		chapters.forEach(chapter => {
			// Update Chapter cache
			this.SetObjectCache(chapter.chapterId, chapter, true)
			
			// Update blogPost cache
			let blogCache = this.cacheManagementService.GetCacheService('blog_cache')
			let blogPost = blogCache.GetCachedObjects()[chapter.storyId]
			if (blogPost) {
				let index = blogPost.chapters.findIndex(c => c.chapterId == chapter.chapterId)
				if (index != -1) {
					blogPost.chapters[index] = chapter
				} else {
					blogPost.chapters.push(chapter)
				}
				blogCache.SetObjectCache(blogPost.storyId, blogPost, true)
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