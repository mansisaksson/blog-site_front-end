import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Story, StoryMetaData } from '../_models/index';

@Injectable()
export class StoryService {
    constructor(private http: HttpClient) { }

    getStoryById(id: number) {
        return this.http.get('/api/stories/' + id);
    }

    createStory(story: Story) {
        return this.http.post('/api/stories', story);
    }

    updateStory(story: Story) {
        return this.http.put('/api/stories/' + story.storyId, story);
    }

    deleteStory(id: number) {
        return this.http.delete('/api/stories/' + id);
    }

    getAllStoriesMetaData() {
        return this.http.get<StoryMetaData[]>('/api/stories_md');
    }

    getStoryMetaData(id: number) {
        return this.http.get<StoryMetaData>('/api/stories_md/' + id);
    }
}