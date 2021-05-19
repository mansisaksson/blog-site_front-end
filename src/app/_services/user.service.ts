import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { User, BackendResponse, BackendError } from '../_models/index'
import { environment } from './../../environments/environment'
import { UserCacheService } from './caching_services';
import { BehaviorSubject, Observable } from 'rxjs'

import { Result, ResultAsync, okAsync, errAsync } from 'neverthrow'

@Injectable()
export class UserService {
	private currentlyViewedUser: BehaviorSubject<User> = new BehaviorSubject<User>(undefined)

	constructor(
		private http: HttpClient,
		private userCacheService: UserCacheService) {
	}

	async getUser(id: string): Promise<Result<User, BackendError>> {
		let usersResult: Result<User[], BackendError> = await this.getUsers([id]);
		if (usersResult.isErr()) {
			return errAsync(usersResult.error);
		}
		if (usersResult.value.length == 0) {
			return errAsync(<BackendError>{ errorCode: "CLIENT_ERROR", errorMessage: `Could not find user with id ${id}` });
		}
		return okAsync(usersResult.value[0]);
	}

	setCurrentlyViewedUser(user: User): void {
		this.currentlyViewedUser.next(user);
	}

	getCurrentlyViewedUser(): Observable<User> {
		return this.currentlyViewedUser.asObservable();
	}

	// Gets the users for the specified user Ids.
	getUsers(ids: string[]): ResultAsync<User[], BackendError> {
		return ResultAsync.fromPromise<User[], BackendError>(new Promise<User[]>((resolve, reject) => {
			let cache = this.userCacheService.FindUserCache(ids);
			if (cache.notFound.length == 0) {
				return resolve(cache.foundUsers);
			}

			this.http.get<BackendResponse>(environment.backendAddr + '/api/users', {
				headers: { 'Content-Type': 'application/json' },
				params: { user_ids: ids },
				responseType: "json",
				withCredentials: false
			}).subscribe((response: BackendResponse) => {
				if (response.success) {
					let users = <User[]>response.body;
					this.userCacheService.UpdateUserCache(users);
					resolve(users);
				} else {
					reject(<BackendError>{ errorCode: response.error_code, errorMessage: response.error_message });
				}
			}, (error) => reject(<BackendError>{ errorCode: "TRANSPORT_ERROR", errorMessage: "http communication error", error: error }))
		}), (error: BackendError) => error);
	}

	createUser(userName: string, password: string, registrationKey: string): ResultAsync<User, BackendError> {
		return ResultAsync.fromPromise<User, BackendError>(new Promise<User>((resolve, reject) => {
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
					reject(<BackendError>{ errorCode: response.error_code, errorMessage: response.error_message });
				}
			}, (error) => reject(<BackendError>{ errorCode: "TRANSPORT_ERROR", errorMessage: "http communication error", error: error }))
		}), (error: BackendError) => error);
	}

	updateUser(userId: string, newUserProperties: object): Promise<User> {
		return new Promise<User>((resolve, reject) => {
			this.http.put<BackendResponse>(environment.backendAddr + '/api/users', JSON.stringify(newUserProperties), {
				headers: { 'Content-Type': 'application/json' },
				params: { userId: userId },
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