import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { Story, StoryMetaData } from '../_models/index';

@Injectable()
export class StoryService {
	constructor(private http: HttpClient) { }

	getStoryById(id: number): Promise<Story> {
		return new Promise<Story>((resolve, reject) => {
			this.http.get('/api/stories/' + id).subscribe((data) => {
				resolve(<Story>data)
			}, (error) => {
				reject(error)
			})
		})
	}

	createStory(userId: number): Promise<Story> {
		return new Promise<Story>((resolve, reject) => {
			this.http.post('/api/stories', userId).subscribe((data) => {
				resolve(<Story>data)
			}, (error) => {
				reject(error)
			})
		})
	}

	updateStory(story: Story): Promise<boolean> {
		return new Promise<boolean>((resolve, reject) => {
			this.http.put('/api/stories/' + story.storyId, story).subscribe((data) => {
				resolve(<boolean>data)
			}, (error) => {
				reject(error)
			})
		})
	}

	deleteStory(id: number): Promise<boolean> {
		return new Promise<boolean>((resolve, reject) => {
			this.http.delete('/api/stories/' + id).subscribe((data) => {
				resolve(<boolean>data)
			}, (error) => {
				reject(error)
			})
		})

	}

	getStoriesMetaData(userId?: number, searchQuery?: string): Promise<StoryMetaData[]> {
		return new Promise<StoryMetaData[]>((resolve, reject) => {
			let params = {
				userId: userId ? userId.toString() : undefined,
				searchQuery: searchQuery
			}

			this.http.get<StoryMetaData[]>('/api/stories_md', { params: params }).subscribe((data) => {
				resolve(data)
			}, (error) => {
				reject(error)
			})
		});


	}

	getStoryMetaData(id: number): Promise<StoryMetaData> {
		return new Promise<StoryMetaData>((resolve, reject) => {
			this.http.get<StoryMetaData>('/api/stories_md/' + id).subscribe((data) => {
				resolve(<StoryMetaData>data)
			}, (error) => {
				reject(error)
			})
		})
	}
}