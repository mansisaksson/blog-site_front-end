import { Injectable } from '@angular/core'
import { CacheService, CacheManagementService } from './cache.service'

@Injectable()
export class BlogQueryCacheService extends CacheService {
	constructor(protected cacheManagementService: CacheManagementService) {
		super('blog_post_query_cache', 20, cacheManagementService)
	}

	private resolveQueryId(userId: string, queryString: string): string {
		let defUserId = userId ? userId : ""
		let defQueryString = queryString ? queryString : ""

		let cacheId = defUserId + defQueryString
		if (cacheId == "") { // Empty query
			cacheId = "default"
		}
		return cacheId
	}

	public UpdateQueryCache(userId: string, queryString: string, blogPostIds: string[]) {
		let cacheId = this.resolveQueryId(userId, queryString)
		this.SetObjectCache(cacheId, blogPostIds, true)
	}

	public FindQueryCache(userId: string, queryString: string): string[] {
		this.ValidateCache()
		let cacheId = this.resolveQueryId(userId, queryString)
		let queryCache = this.GetCachedObjects()[cacheId]
		if (queryCache) {
			return queryCache
		}
		return []
	}
}