import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { User } from '../_models/index';

@Injectable()
export class UserService {
	constructor(private http: HttpClient) { }

	getAll(): Promise<User[]> {
		return new Promise<User[]>((resolve, reject) => {
			this.http.get<User[]>('/api/users').subscribe((data) => {
				resolve(data)
			}, (error) => {
				reject(error)
			})
		})
	}

	getById(id: number): Promise<User> {
		return new Promise<User>((resolve, reject) => {
			this.http.get('/api/users/' + id).subscribe((data) => {
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
		return new Promise<boolean>((resolve, reject) => {
			this.http.put('/api/users/' + user.id, user).subscribe((data) => {
				resolve(<boolean>data)
			}, (error) => {
				reject(error)
			})
		})
	}

	delete(id: number): Promise<boolean> {
		return new Promise<boolean>((resolve, reject) => {
			this.http.delete('/api/users/' + id).subscribe((data) => {
				resolve(<boolean>data)
			}, (error) => {
				reject(error)
			})
		})
	}
}