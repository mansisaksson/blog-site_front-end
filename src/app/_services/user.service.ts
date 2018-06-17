import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { User } from '../_models/index';

@Injectable()
export class UserService {
	constructor(private http: HttpClient) { }

	getAll(): Promise<User[]> {
		return new Promise<User[]>((resolve, reject) => {
			let params = {
				// TODO: add search functionality
			}
			this.http.get<User[]>('/api/users/query', { params: params }).subscribe((data) => {
				resolve(data)
			}, (error) => {
				reject(error)
			})
		})
	}

	getById(id: string): Promise<User> {
		return new Promise<User>((resolve, reject) => {
			let params = {
				userId: id
			}
			this.http.get('/api/users', { params: params }).subscribe((data) => {
				resolve(<User>data)
			}, (error) => {
				reject(error)
			})
		})
	}

	create(user: User): Promise<User> {
		return new Promise<User>((resolve, reject) => {
			this.http.post('/api/users', user).subscribe((data) => {
				resolve(<User>data)
			}, (error) => {
				reject(error)
			})
		})
	}

	update(user: User): Promise<boolean> {
		console.log("update user - NOT YET IMPLEMENTED")
		return new Promise<boolean>((resolve, reject) => {
			return reject("not yet implemented")
			// this.http.put('/api/users', JSON.stringify(user)).subscribe((data) => {
			// 	resolve(<boolean>data)
			// }, (error) => {
			// 	reject(error)
			// })
		})
	}

	delete(id: string): Promise<boolean> {
		return new Promise<boolean>((resolve, reject) => {
			let params = {
				userId: id
			}
			this.http.delete('/api/users', { params: params }).subscribe((data) => {
				resolve(<boolean>data)
			}, (error) => {
				reject(error)
			})
		})
	}
}