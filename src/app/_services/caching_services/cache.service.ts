import { Injectable } from '@angular/core'

export class CacheService {
	private cachedObjects: { [key: string]: any } = {}
	private cacheTimeStamp: { [key: string]: number } = {}

	constructor(
		protected cacheId: string,
		protected TimeToInvalidate: number,
		protected cacheManagementService: CacheManagementService) {
		this.LoadCache()
		cacheManagementService.RegisterCacheService(cacheId, this)
	}

	public ClearCache(): void {
		this.cachedObjects = {}
		this.cacheTimeStamp = {}

		this.SaveCache()
	}

	public LoadCache(): void {
		let objectCache = JSON.parse(localStorage.getItem(this.cacheId))
		if (objectCache) {
			this.cachedObjects = objectCache
		}

		let cacheTimeStamp = JSON.parse(localStorage.getItem(this.cacheId + '_timestamps'))
		if (cacheTimeStamp) {
			this.cacheTimeStamp = cacheTimeStamp
		}
	}

	public SaveCache() {
		try {
			localStorage.setItem(this.cacheId, JSON.stringify(this.cachedObjects))
			localStorage.setItem(this.cacheId + '_timestamps', JSON.stringify(this.cacheTimeStamp))
		} catch (error) {
			localStorage.clear()
		}
		
		
		this.LoadCache() // Makes sure that any object saved in the cache lists are destroyed
	}

	protected ValidateCache() {
		let needsResave = false
		Object.keys(this.cacheTimeStamp).forEach(id => {
			let cacheAge = Date.now() - this.cacheTimeStamp[id]
			if (cacheAge > this.TimeToInvalidate * 1000) {
				delete this.cachedObjects[id]
				delete this.cacheTimeStamp[id]
				needsResave = true
			}
		})

		if (needsResave) {
			this.SaveCache()
		}
	}

	public InvalidateObjectCache(id: string, resave: boolean) {
		delete this.cachedObjects[id]
		delete this.cacheTimeStamp[id]
		if (resave) {
			this.SaveCache()
		}
	}

	private UpdateIdTimeStamp(id: string) {
		this.cacheTimeStamp[id] = Date.now()
	}

	/* BEGIN GET-SETTERS */
	public GetCachedObjects(): { readonly [key: string]: any } {
		return this.cachedObjects;
	}
	
	public SetObjectCache(id: string, object: any, resave: boolean): void {
		this.cachedObjects[id] = object
		this.UpdateIdTimeStamp(id)
		if (resave) {
			this.SaveCache()
		}
	}
	/* END GET-SETTERS */
}

@Injectable()
export class CacheManagementService {
	private cacheServices: { [key: string]: CacheService } = {}

	constructor() {

	}

	public RegisterCacheService(id: string, cacheService: CacheService) {
		this.cacheServices[id] = cacheService
	}

	public GetCacheService(id: string): CacheService {
		return this.cacheServices[id]
	}
}