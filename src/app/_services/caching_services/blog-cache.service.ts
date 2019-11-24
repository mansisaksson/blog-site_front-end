import { Injectable } from '@angular/core'
import { BlogPostMetaData } from '../../_models'
import { CacheService, CacheManagementService } from './cache.service';

@Injectable()
export class BlogCacheService extends CacheService {
	constructor(protected cacheManagementService: CacheManagementService) {
		super('blog_cache', 20, cacheManagementService)
	}

	public UpdateBlogCache(blogPosts: BlogPostMetaData[]) {
		blogPosts.forEach(blogPost => {
			this.SetObjectCache(blogPost.storyId, blogPost, false)

			let chaperCacheService = this.cacheManagementService.GetCacheService('blog_chapter_cache')
			blogPost.chapters.forEach(chapter => {
				chaperCacheService.SetObjectCache(chapter.chapterId, chapter, false)
			})
			chaperCacheService.SaveCache()
		})
		this.SaveCache()
	}

	public InvalidateBlogCache(blogPostIds: string[]) {
		blogPostIds.forEach(blogPostId => {
			let blogPost = this.GetCachedObjects()[blogPostId]
			if (blogPost) {
				let chaperCacheService = this.cacheManagementService.GetCacheService('blog_chapter_cache')
				blogPost.chapters.forEach(chapter => {
					chaperCacheService.InvalidateObjectCache(chapter.chapterId, false)
				})
				chaperCacheService.SaveCache()
				this.InvalidateObjectCache(blogPostId, true)
			}
		})
	}

	public FindBlogCache(blogPostIds: string[]): { notFound: string[], foundBlogPosts: BlogPostMetaData[] } {
		this.ValidateCache()
		let result = { notFound: [], foundBlogPosts: [] }
		blogPostIds.forEach(blogPostId => {
			let blogPost = this.GetCachedObjects()[blogPostId]
			if (blogPost != undefined) {
				result.foundBlogPosts.push(blogPost)
			} else {
				result.notFound.push(blogPostId)
			}
		})
		return result
	}
}