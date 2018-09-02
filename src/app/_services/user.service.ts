import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { User, BackendResponse } from '../_models/index'
import { environment } from './../../environments/environment'

@Injectable()
export class UserService {
	constructor(private http: HttpClient) { }

	getAll(): Promise<User[]> {
		return new Promise<User[]>((resolve, reject) => {
			let params = {
				// TODO: add search functionality
			}
			this.http.get<BackendResponse>(environment.backendAddr + '/api/users/query', { params: params }).subscribe((data) => {
				let response = <BackendResponse>data
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
			this.http.get<BackendResponse>(environment.backendAddr + '/api/users', { params: params }).subscribe((data) => {
				let response = <BackendResponse>data
				if (response.success) {
					resolve(<User>response.body)
				} else {
					reject(response.error_code)
				}
			}, (error) => reject(error))
		})
	}

	authenticate(userName: string, password: string): Promise<User> {
		return new Promise<User>((resolve, reject) => {
			let params = {
				user_name: userName,
				user_password: password
			}
			this.http.get<BackendResponse>(environment.backendAddr + '/api/authenticate', { params: params, withCredentials: true }).subscribe(data => {
				let response = <BackendResponse>data
				if (response.success) {
					resolve(<User>response.body)
				} else {
					reject(response.error_code)
				}
			}, (e) => reject(e))
		})
	}

	getSession(): Promise<User> {
		return new Promise<User>((resolve, reject) => {
			this.http.get<BackendResponse>(environment.backendAddr + '/api/session', { withCredentials: true }).subscribe(data => {
				let response = <BackendResponse>data
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
			this.http.post<BackendResponse>(environment.backendAddr + '/api/session/invalidate', {}, { withCredentials: true }).subscribe(data => {
				let response = <BackendResponse>data
				if (response.success) {
					resolve(<boolean>response.body)
				} else {
					reject(response.error_code)
				}
			}, (e) => reject(e))
		})
	}

	create(userName: string, password: string): Promise<User> {
		return new Promise<User>((resolve, reject) => {
			let params = {
				user_name: userName,
				user_password: password
			}
			this.http.post<BackendResponse>(environment.backendAddr + '/api/users', {}, { params: params, withCredentials: true }).subscribe((data) => {
				let response = <BackendResponse>data
				if (response.success) {
					resolve(<User>response.body)
				} else {
					reject(response.error_code)
				}
			}, (error) => reject(error))
		})
	}

	update(user: any): Promise<User> {
		return new Promise<User>((resolve, reject) => {
			let params = {
			}
			this.http.put<BackendResponse>(environment.backendAddr + '/api/users', JSON.stringify(user), { params: params, withCredentials: true }).subscribe((data) => {
				let response = <BackendResponse>data
				if (response.success) {
					resolve(<User>response.body)
				} else {
					reject(response.error_code)
				}
			}, (error) => reject(error))
		})
	}

	delete(id: string): Promise<any> {
		return new Promise<any>((resolve, reject) => {
			let params = {
				userId: id
			}
			this.http.delete<BackendResponse>(environment.backendAddr + '/api/users', { params: params, withCredentials: true }).subscribe((data) => {
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