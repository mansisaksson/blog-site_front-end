import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { Story, StoryMetaData } from '../_models/index';

@Injectable()
export class StoryService {
    constructor(private http: HttpClient) { }

    getStoryById(id: number) {
        return this.http.get('/api/stories/' + id);
    }

    createStory(userId: number) {
        return this.http.post('/api/stories', userId);
    }

    updateStory(story: Story) {
        return this.http.put('/api/stories/' + story.storyId, story);
    }

    deleteStory(id: number) {
        return this.http.delete('/api/stories/' + id);
    }

    getStoriesMetaData(userId?:number, searchQuery?:string) {
        let params = new HttpParams();

        if (userId !== undefined)
            params.set("userId", userId.toString());
        if (searchQuery !== undefined)
            params.set("searchQuery", searchQuery.toString());

        return this.http.get<StoryMetaData[]>('/api/stories_md', {
            params: params
        });
    }

    getStoryMetaData(id: number) {
        return this.http.get<StoryMetaData>('/api/stories_md/' + id);
    }
}