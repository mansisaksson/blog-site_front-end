﻿import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { User, BackendResponse } from '../_models/index'
import { environment } from './../../environments/environment'
import { UserCacheService } from './caching_services';
import { BehaviorSubject, Observable } from 'rxjs'

@Injectable()
export class UserService {
	private currentlyViewedUser: BehaviorSubject<User> = new BehaviorSubject<User>(undefined)

	constructor(
		private http: HttpClient,
		private userCacheService: UserCacheService) {
	}

	getUser(id: string): Promise<User> {
		return new Promise<User>((resolve, reject) => {
			return this.getUsers([id]).then(users => {
				resolve(users && users.length > 0 ? users[0] : undefined)
			}).catch(e => reject(e))
		})
	}

	setCurrentlyViewedUser(user: User) {
		this.currentlyViewedUser.next(user)
	}

	getCurrentlyViewedUser(): Observable<User> {
		return this.currentlyViewedUser.asObservable()
	}

	getUsers(ids: string[]): Promise<User[]> {
		return new Promise<User[]>((resolve, reject) => {
			let cache = this.userCacheService.FindUserCache(ids)
			if (cache.notFound.length == 0) {
				return resolve(cache.foundUsers)
			}

			let params = {
				user_ids: ids
			}
			this.http.get<BackendResponse>(environment.backendAddr + '/api/users', {
				headers: { 'Content-Type': 'application/json' },
				params: params,
				responseType: "json",
				withCredentials: false
			}).subscribe((response: BackendResponse) => {
				if (response.success) {
					let users = <User[]>response.body
					this.userCacheService.UpdateUserCache(users)
					resolve(users)
				} else {
					reject(response.error_code)
				}
			}, (error) => reject(error))
		})
	}

	createUser(userName: string, password: string, registrationKey: string): Promise<User> {
		return new Promise<User>((resolve, reject) => {
			let body = {
				userName: userName,
				userPassword: password,
				registrationKey: registrationKey
			}
			this.http.post<BackendResponse>(environment.backendAddr + '/api/users', JSON.stringify(body), {
				headers: { 'Content-Type': 'application/json' },
				responseType: "json",
				withCredentials: true
			}).subscribe((data) => {
				let response = <BackendResponse>data
				if (response.success) {
					let user = <User>response.body
					this.userCacheService.UpdateUserCache([user])
					resolve(user)
				} else {
					reject(response.error_code)
				}
			}, (error) => reject(error))
		})
	}

	updateUser(userId: string, newUserProperties: object): Promise<User> {
		return new Promise<User>((resolve, reject) => {
			let params = {
				userId: userId
			}
			this.http.put<BackendResponse>(environment.backendAddr + '/api/users', JSON.stringify(newUserProperties), {
				headers: { 'Content-Type': 'application/json' },
				params: params,
				responseType: "json",
				withCredentials: true
			}).subscribe((data) => {
				let response = <BackendResponse>data
				if (response.success) {
					let user = <User>response.body
					this.userCacheService.UpdateUserCache([user])
					resolve(user)
				} else {
					reject(response.error_code)
				}
			}, (error) => reject(error))
		})
	}

	delete(id: string, password: string): Promise<any> {
		return new Promise<any>((resolve, reject) => {
			let params = {
				userId: id,
				userPassword: password
			}
			this.http.delete<BackendResponse>(environment.backendAddr + '/api/users', {
				headers: { 'Content-Type': 'application/json' },
				params: params,
				responseType: "json",
				withCredentials: true
			}).subscribe((data) => {
				let response = <BackendResponse>data
				if (response.success) {
					this.userCacheService.InvalidateUserCache([id])
					resolve(response.body)
				} else {
					reject(response.error_code)
				}
			}, (error) => reject(error))
		})
	}
}