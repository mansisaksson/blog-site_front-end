import { Component, OnInit } from '@angular/core'
import { DataService } from '../../_services/data.service'

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
    this.dataService.getStoryMetaData()
    .subscribe((data: StoryMetaData[]) => {
      this.storyMetaData = data;
    })
  }

  // unix time is measured in seconds (not milliseconds)
  timeSince(date:number) {
    let seconds = Math.floor(Date.now() / 1000 - date);
    let interval = Math.floor(seconds / 31536000);
    
    if (interval > 1) {
      return interval + " years";
    }
    interval = Math.floor(seconds / 2592000);
    if (interval > 1) {
      return interval + " months";
    }
    interval = Math.floor(seconds / 86400);
    if (interval > 1) {
      return interval + " days";
    }
    interval = Math.floor(seconds / 3600);
    if (interval > 1) {
      return interval + " hours";
    }
    interval = Math.floor(seconds / 60);
    if (interval > 1) {
      return interval + " minutes";
    }
    return Math.floor(seconds) + " seconds";
  }
  
}

interface StoryMetaData {
  title:string,
  authorName:string,
  storyId:number,
  upvotes:number,
  downvotes:number,
  thumbnail:string,
  submittedAt:number
  lastUpdated:number
}