﻿import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs/Rx';
import { toPromise } from 'rxjs/operator/toPromise'
import { User } from '../_models/index'
import 'rxjs/add/operator/map'

@Injectable()
export class AuthenticationService {
	isLoggedIn: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	currentUser: BehaviorSubject<User> = new BehaviorSubject<User>(undefined);

	constructor(private http: HttpClient) {
		this.refreshLoginState()
	}

	login(username: string, password: string): Promise<User> {
		return new Promise<User>((resolve, reject) => {
			this.http.post<any>('/api/authenticate', { username: username, password: password }).subscribe(user => {
				if (user && user.token) {
					localStorage.setItem('currentUser', JSON.stringify(user))
				}

				this.refreshLoginState()
				resolve(user)
			}, (e) => {
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

	refreshLoginState() {
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