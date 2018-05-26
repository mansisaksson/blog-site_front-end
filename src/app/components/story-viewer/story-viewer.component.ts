import { Component, OnInit, Input } from '@angular/core'
import { ActivatedRoute, Params } from '@angular/router'
import { StoryService, AlertService } from '../../_services/index'
import { Story } from '../../_models/index'
import { AlertComponent } from '../../_directives/index'

@Component({
  selector: 'app-story-viewer',
  templateUrl: './story-viewer.component.html',
  styleUrls: ['./story-viewer.component.css']
})
export class StoryViewerComponent implements OnInit {
  storyId: number;
  story: Story;

  constructor(
    private storyService: StoryService,
    private alertService: AlertService,
    private activatedRoute: ActivatedRoute
  ) {
    this.story = new Story();
  }

  ngOnInit() {
    this.activatedRoute.params.subscribe((params: Params) => {
      this.storyId = params['story_id'];
      this.refreshStory();
    });
  }

  refreshStory() {
    this.storyService.getStoryById(this.storyId).then((story: Story) => {
      this.story = story
    }).catch((error) => {
      this.alertService.error(error.error)
    })
  }
}
