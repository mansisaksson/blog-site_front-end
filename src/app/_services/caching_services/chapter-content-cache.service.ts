import { Injectable } from '@angular/core'
import { ChapterContent } from '../../_models'
import { CacheService, CacheManagementService } from './cache.service';

@Injectable()
export class ChapterContentCacheService extends CacheService {
	constructor(protected cacheManagementService: CacheManagementService) {
		super('blog_chapter_content_cache', 20, cacheManagementService)
	}

	public UpdateChapterContentCache(contents: ChapterContent[]) {
		contents.forEach(content => {
			this.SetObjectCache(content.URI, content, false)
		})
		this.SaveCache()
	}

	public InvalidateChapterContentCache(contentURIs: string[]) {
		contentURIs.forEach(uri => {
			this.InvalidateObjectCache(uri, false)
		})
		this.SaveCache()
	}

	public FindChapterContentCache(contentURIs: string[]): { notFound: string[], foundContents: ChapterContent[] } {
		this.ValidateCache()
		let result = { notFound: [], foundContents: [] }
		contentURIs.forEach(uri => {
			let content = this.GetCachedObjects()[uri]
			if (content != undefined) {
				result.foundContents.push(content)
			} else {
				result.notFound.push(uri)
			}
		})
		return result
	}
}