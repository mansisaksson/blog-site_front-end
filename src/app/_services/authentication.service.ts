import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs/Rx';
import { User } from '../_models/index'
import { UIService } from './ui.service';
import { UserService } from './user.service';

@Injectable()
export class AuthenticationService {
	private isLoggedIn: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	private currentUser: BehaviorSubject<User> = new BehaviorSubject<User>(undefined);

	constructor(
		private userService: UserService,
		private uiService: UIService) {
		this.refreshLoginState()
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
				if (user) {
					localStorage.setItem('currentUser', JSON.stringify(user))
				}
				this.refreshLoginState()
				resolve(user)
			}).catch(e => {
				this.refreshLoginState()
				reject(e)
			})
		})
	}

	logout(): Promise<boolean> {
		return new Promise<boolean>((resolve, reject) => {
			localStorage.removeItem('currentUser')
			this.refreshLoginState()
			resolve(true)
		})
	}

	getIsLoggedIn(): Observable<boolean> {
		this.refreshLoginState()
		return this.isLoggedIn.asObservable()
	}

	getCurrentUser(): Observable<User> {
		this.refreshLoginState()
		return this.currentUser.asObservable()
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