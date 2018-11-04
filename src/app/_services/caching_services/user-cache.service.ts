import { Injectable } from '@angular/core'
import { User } from '../../_models'
import { CacheService, CacheManagementService } from './cache.service';

@Injectable()
export class UserCacheService extends CacheService {
	constructor(protected cacheManagementService: CacheManagementService) {
		super('user_cache', 60, cacheManagementService)
	}

	public UpdateUserCache(users: User[]) {
		users.forEach(user => {
			this.SetObjectCache(user.id, user, false)
		})
		this.SaveCache()
	}

	public InvalidateUserCache(userIds: string[]) {
		userIds.forEach(userId => {
				this.InvalidateObjectCache(userId, true)
		})
	}

	public FindUserCache(userIds: string[]): { notFound: string[], foundUsers: User[] } {
		this.ValidateCache()
		let result = { notFound: [], foundUsers: [] }
		userIds.forEach(userId => {
			let user = this.GetCachedObjects()[userId]
			if (user != undefined) {
				result.foundUsers.push(user)
			} else {
				result.notFound.push(userId)
			}
		})
		return result
	}
}