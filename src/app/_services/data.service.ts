import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'

@Injectable()
export class DataService {

  constructor(public http:HttpClient) {
  }

  // old from tutorial
  getPosts() {
    return this.http.get('//jsonplaceholder.typicode.com/posts');
  }

  getStoryMetaData() {
    return this.http.get('//mansisaksson.com/scripts/scripts/json_post/stories_meta_data.php');
  }

  getStory(storyId:string) {
    let url = '//mansisaksson.com/scripts/scripts/json_post/generate_story.php?' + storyId;
    return this.http.get(url);
  }
}
