import { Component, OnInit, } from '@angular/core';
import { StoryEditorComponent } from './../story-editor.component'

@Component({
  selector: 'app-story-nav-menu',
  templateUrl: './story-nav-menu.component.html',
  styleUrls: ['./story-nav-menu.component.css']
})
export class StoryNavMenuComponent implements OnInit {
  constructor() {
  }

  ngOnInit() {
    //this.storyEditors.changes.subscribe((r) => { this.refresh(); });
  }

  refresh() {
    // this.storyEditors.map(p => {
    //   console.log(p)
    // })
  }
}
