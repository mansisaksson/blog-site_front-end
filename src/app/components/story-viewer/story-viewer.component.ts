import { Component, OnInit } from '@angular/core'
import { Router, ActivatedRoute, Params } from '@angular/router'
import * as quill from 'quill'

@Component({
  selector: 'app-story-viewer',
  templateUrl: './story-viewer.component.html',
  styleUrls: ['./story-viewer.component.css']
})
export class StoryViewerComponent implements OnInit {
  public storyId: string;
  
  //private editor: quill.Quill;

  constructor(private activatedRoute: ActivatedRoute) {

  }

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      this.storyId = params['story-id'];
      console.log(this.storyId); // Print the parameter to the console. 
    });

    var options = {
      debug: 'info',
      modules: {
        toolbar: '#toolbar'
      },
      placeholder: 'Compose an epic...',
      readOnly: true,
      theme: 'snow'
    };
    console.log(quill);
    //var test = new quill.Quill('.editor', options);
  }
}
