import { Component, OnInit } from '@angular/core'
import { DataService } from '../../services/data.service'

@Component({
  selector: 'app-story-explorer',
  templateUrl: './story-explorer.component.html',
  styleUrls: ['./story-explorer.component.css']
})
export class StoryExplorerComponent implements OnInit {
  storyMetaData:StoryMetaData[];

  constructor(private dataService:DataService) {

  }

  ngOnInit() {
    this.dataService.getStoryMetaData().subscribe((posts) => {
      this.storyMetaData = posts;
      console.log(posts);
    })
  }

}

interface StoryMetaData {
  title:string,
  authorName:string,
  storyId:number
}