import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Story, StoryMetaData } from '../_models/index';

@Injectable()
export class StoryService {
    constructor(private http: HttpClient) { }

    getAll() {
        return this.http.get<Story[]>('/api/stories');
    }

    getById(id: number) {
        return this.http.get('/api/stories/' + id);
    }

    create(story: Story) {
        return this.http.post('/api/stories', story);
    }

    update(story: Story) {
        return this.http.put('/api/stories/' + story.id, story);
    }

    delete(id: number) {
        return this.http.delete('/api/stories/' + id);
    }

    getAllStoryMetaData() {
        return this.http.get<StoryMetaData[]>('/api/stories_md');
    }

    getStoryMetaData(id: number) {
        return this.http.get<StoryMetaData>('/api/stories_md/' + id);
    }
}