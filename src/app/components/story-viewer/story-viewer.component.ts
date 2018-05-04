import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

@Component({
  selector: 'app-story-viewer',
  templateUrl: './story-viewer.component.html',
  styleUrls: ['./story-viewer.component.css']
})
export class StoryViewerComponent implements OnInit {
  public storyId: string;
  
  constructor(private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      this.storyId = params['story-id'];
      console.log(this.storyId); // Print the parameter to the console. 
    });
  }

}
