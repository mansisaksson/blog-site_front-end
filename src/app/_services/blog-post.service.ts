import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'

import { ChapterContent, BlogPostMetaData, ChapterMetaData, BackendResponse } from '../_models'
import { BehaviorSubject, Observable } from 'rxjs'
import { environment } from '../../environments/environment'
import { BlogCacheService, ChapterCacheService, ChapterContentCacheService, BlogQueryCacheService } from './caching_services'

@Injectable()
export class BlogPostService {
	private currentBlogPost: BehaviorSubject<BlogPostMetaData> = new BehaviorSubject<BlogPostMetaData>(undefined)

	constructor(
		private http: HttpClient, 
		private BlogCacheService: BlogCacheService,
		private chapterCacheService: ChapterCacheService, 
		private chapterContentCacheService: ChapterContentCacheService, 
		private blogQueryCacheService: BlogQueryCacheService) {
	}

	setCurrentlyViewedBlogPost(blogPost: BlogPostMetaData) {
		this.currentBlogPost.next(blogPost)
	}

	getCurrentlyViewedBlogPost(): Observable<BlogPostMetaData> {
		return this.currentBlogPost.asObservable()
	}

	createBlogPost(userId: string, title: string, chapter1Title: string): Promise<BlogPostMetaData> {
		return new Promise<BlogPostMetaData>((resolve, reject) => {
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
					let blogPost = <BlogPostMetaData>response.body
					this.BlogCacheService.UpdateBlogCache([blogPost])
					resolve(blogPost)
				} else {
					reject(response.error_code)
				}
			}, (error) => reject(error))
		})
	}

	updateBlogPost(blogPostId: string, newBlogProperties: object): Promise<BlogPostMetaData> {
		return new Promise<BlogPostMetaData>((resolve, reject) => {
			let params = {
				blogPostId: blogPostId
			}
			this.http.put<BackendResponse>(environment.backendAddr + '/api/stories', JSON.stringify(newBlogProperties), { 
				headers: { 'Content-Type': 'application/json' },
				params: params,
				responseType: "json",
				withCredentials: true
			}).subscribe((response: BackendResponse) => {
				if (response.success) {
					let blogPost = <BlogPostMetaData>response.body
					this.BlogCacheService.UpdateBlogCache([blogPost])
					resolve(blogPost)
				} else {
					reject(response.error_code)
				}
			}, (error) => reject(error))
		})
	}

	deleteBlogPost(id: string): Promise<any> {
		return new Promise<any>((resolve, reject) => {
			let params = {
				blogPostId: id
			}
			this.http.delete<BackendResponse>(environment.backendAddr + '/api/stories', { 
				headers: { 'Content-Type': 'application/json' },
				params: params,
				responseType: "json",
				withCredentials: true
			}).subscribe((response: BackendResponse) => {
				if (response.success) {
					this.BlogCacheService.InvalidateBlogCache([id])
					resolve(response.body)
				} else {
					reject(response.error_code)
				}
			}, (error) => reject(error))
		})
	}

	getBlogPosts(userId?: string, searchQuery?: string): Promise<BlogPostMetaData[]> {
		return new Promise<BlogPostMetaData[]>((resolve, reject) => {
			let cachedIds = this.blogQueryCacheService.FindQueryCache(userId ? userId : "", searchQuery ? searchQuery : "")
			if (cachedIds.length > 0) {
				let cache = this.BlogCacheService.FindBlogCache(cachedIds)
				if (cache.notFound.length == 0) {
					return resolve(cache.foundBlogPosts)
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
					let stories: BlogPostMetaData[] = <BlogPostMetaData[]>response.body
					this.BlogCacheService.UpdateBlogCache(stories)
					let blogPostIds = stories.map(s => s.storyId)
					this.blogQueryCacheService.UpdateQueryCache(userId, searchQuery, blogPostIds)
					resolve(stories)
				} else {
					reject(response.error_code)
				}
			}, (error) => reject(error))
		})
	}

	getBlog(id: string): Promise<BlogPostMetaData> {
		return new Promise<BlogPostMetaData>((resolve, reject) => {
			let cachedBlog = this.BlogCacheService.FindBlogCache([id]).foundBlogPosts.find(s => { return s.storyId == id })
			if (cachedBlog != undefined) {
				return resolve(cachedBlog)
			}

			let params = {
				blogPostId: id
			}
			this.http.get<BackendResponse>(environment.backendAddr + '/api/stories', { 
				headers: { 'Content-Type': 'application/json' },
				params: params,
				responseType: "json",
				withCredentials: true
			}).subscribe((response: BackendResponse) => {
				if (response.success) {
					let blogPost = <BlogPostMetaData>response.body
					this.BlogCacheService.UpdateBlogCache([blogPost])
					resolve(blogPost)
				} else {
					reject(response.error_code)
				}
			}, (error) => reject(error))
		})
	}

	getBlogChapter(chapterId: string): Promise<ChapterMetaData> {
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
	createChapter(blogPostId: string, chapterTitle: string): Promise<ChapterMetaData> {
		return new Promise<ChapterMetaData>((resolve, reject) => {
			let params = {
				blogPostId: blogPostId
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

	deleteChapter(chapterId: string): Promise<BlogPostMetaData> {
		return new Promise<BlogPostMetaData>((resolve, reject) => {
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
					let blogPost = <BlogPostMetaData>response.body
					this.BlogCacheService.UpdateBlogCache([blogPost])
					resolve(blogPost)
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