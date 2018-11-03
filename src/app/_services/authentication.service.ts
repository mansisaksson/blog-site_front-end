﻿import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs/Rx';
import { User } from '../_models/index'
import { UIService } from './ui.service';
import { UserService } from './user.service';
import { AlertService } from './alert.service';
import { CacheManagementService } from './caching_services';

@Injectable()
export class AuthenticationService {
	private isLoggedIn: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false)
	private currentUser: BehaviorSubject<User> = new BehaviorSubject<User>(undefined)
	private lastValidateTime: number = 0
	private revalidateTime: number = 20 * 1000

	constructor(
		private userService: UserService,
		private uiService: UIService,
		private alertService: AlertService,
		private cacheManagementService: CacheManagementService) {
		this.validateLoginState()
	}

	withLoggedInUser(): Promise<User> {
		return new Promise<User>((resolve, reject) => {
			this.getCurrentUser().subscribe((user: User) => {
				if (user) {
					resolve(user)
				}
				else {
					let onCanceled = () => {
						reject("Action Canceled")
					}
					this.uiService.promptUserLogin('', onCanceled)
				}
			})
		})
	}

	login(username: string, password: string): Promise<User> {
		return new Promise<User>((resolve, reject) => {
			this.userService.authenticate(username, password).then((user: User) => {
				// Clear out our queries since they give different results depending on whether the user is logged in
				this.cacheManagementService.GetCacheService('story_query_cache').ClearCache()
				this.setUserSession(user)
				resolve(user)
			}).catch(e => {
				// Clear out our queries since they give different results depending on whether the user is logged in
				this.cacheManagementService.GetCacheService('story_query_cache').ClearCache()
				this.setUserSession(undefined)
				reject(e)
			})
		})
	}

	logout(): Promise<boolean> {
		return new Promise<boolean>((resolve, reject) => {
			this.userService.invalidateSession().then(() => {
				this.setUserSession(undefined)
				resolve(true)
			}).catch((e) => { 
				this.setUserSession(undefined)
				reject(e)
			})
		})
	}

	getIsLoggedIn(): Observable<boolean> {
		this.validateLoginState()
		return this.isLoggedIn.asObservable()
	}

	getCurrentUser(): Observable<User> {
		this.validateLoginState()
		return this.currentUser.asObservable()
	}

	setUserSession(user: User) {
		if (!user) {
			localStorage.removeItem('currentUser')
		} else {
			localStorage.setItem('currentUser', JSON.stringify(user))
		}
		this.lastValidateTime = Date.now()
		this.refreshLoginState()
	}

	private validateLoginState() {
		let timeSinceUpdate = Date.now() - this.lastValidateTime
		if (timeSinceUpdate > this.revalidateTime) {
			this.userService.getSession().then((user) => {
				this.setUserSession(user)
				this.refreshLoginState()
			}).catch(error => {
				console.log(error)
			})
		}
		else {
			this.refreshLoginState()
		}
	}

	private refreshLoginState() {
		let localUser = JSON.parse(localStorage.getItem('currentUser'))
		if (this.currentUser.getValue() !== localUser) {
			this.currentUser.next(localUser)
		}

		let isLoggedIn = localUser ? true : false;
		if (this.isLoggedIn.getValue() !== isLoggedIn) {
			this.isLoggedIn.next(isLoggedIn)
		}
	}
}