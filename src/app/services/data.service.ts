import { Injectable } from '@angular/core';
import { Http } from '@angular/http'
import 'rxjs/add/operator/map'

@Injectable()
export class DataService {

  constructor(public http:Http) {
    console.log("data service connected")
   }

   getPosts() {
    return this.http.get('https://jsonplaceholder.typicode.com/posts')
      .map(res => res.json())
   }

   getStoryMetaData() {
    return this.http.get('http://mansisaksson.com/scripts/scripts/json_post/stories_meta_data.php')
    .map(res => res.json())
   }
}
