import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { User, BackendResponse } from '../_models/index'
import { environment } from './../../environments/environment'

@Injectable()
export class UserService {
	constructor(private http: HttpClient) { }

	authenticate(userName: string, password: string): Promise<User> {
		return new Promise<User>((resolve, reject) => {
			let body = {
				user_name: userName,
				user_password: password
			}
			this.http.post<BackendResponse>(environment.backendAddr + '/api/authenticate', JSON.stringify(body), { 
				headers: { 'Content-Type': 'application/json' },
				responseType: "json",
				withCredentials: true
			}).subscribe((response: BackendResponse) => {
				if (response.success) {
					resolve(<User>response.body)
				} else {
					reject(response.error_code)
				}
			}, (e) => reject(e))
		})
	}

	invalidateSession(): Promise<boolean> {
		return new Promise<boolean>((resolve, reject) => {
			let body = {}
			this.http.post<BackendResponse>(environment.backendAddr + '/api/session/invalidate', JSON.stringify(body), { 
				headers: { 'Content-Type': 'application/json' },
				responseType: "json",
				withCredentials: true
			}).subscribe(data => {
				let response = <BackendResponse>data
				if (response.success) {
					resolve(<boolean>response.body)
				} else {
					reject(response.error_code)
				}
			}, (e) => reject(e))
		})
	}

	getSession(): Promise<User> {
		return new Promise<User>((resolve, reject) => {
			this.http.get<BackendResponse>(environment.backendAddr + '/api/session', { 
				headers: { 'Content-Type': 'application/json' },
				responseType: "json",
				withCredentials: true
			}).subscribe((response: BackendResponse) => {
				if (response.success) {
					resolve(<User>response.body)
				} else {
					reject(response.error_code)
				}
			}, (e) => reject(e))
		})
	}

	getAll(): Promise<User[]> {
		return new Promise<User[]>((resolve, reject) => {
			let params = {
				// TODO: add search functionality
			}
			this.http.get<BackendResponse>(environment.backendAddr + '/api/users/query', { 
				headers: { 'Content-Type': 'application/json' },
				params: params,
				responseType: "json",
				withCredentials: false
			}).subscribe((response: BackendResponse) => {
				if (response.success) {
					resolve(response.body)
				} else {
					reject(response.error_code)
				}
			}, (error) => reject(error))
		})
	}

	getById(id: string): Promise<User> {
		return new Promise<User>((resolve, reject) => {
			let params = {
				user_id: id
			}
			this.http.get<BackendResponse>(environment.backendAddr + '/api/users', { 
				headers: { 'Content-Type': 'application/json' },
				params: params,
				responseType: "json",
				withCredentials: false
			}).subscribe((response: BackendResponse) => {
				if (response.success) {
					resolve(<User>response.body)
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
					resolve(<User>response.body)
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
					resolve(<User>response.body)
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
					resolve(response.body)
				} else {
					reject(response.error_code)
				}
			}, (error) => reject(error))
		})
	}
}