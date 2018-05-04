import { Injectable } from '@angular/core'
import { Http } from '@angular/http'
import 'rxjs/add/operator/map'

@Injectable()
export class DataService {

  constructor(public http:Http) {
    console.log("data service connected")
   }

   // old from tutorial
   getPosts() {
    return this.http.get('//jsonplaceholder.typicode.com/posts')
      .map(res => res.json())
   }

   getStoryMetaData() {
     return this.http.get('//mansisaksson.com/scripts/scripts/json_post/stories_meta_data.php')
     .map(res => res.json())
   }

   getStory(storyId:string) {
     let url = '//mansisaksson.com/scripts/scripts/json_post/generate_story.php?' + storyId;
     return this.http.get(url)
     .map(res => res.json())
    }
}
