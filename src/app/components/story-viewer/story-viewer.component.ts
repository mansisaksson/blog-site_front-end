import { Component, OnInit, Input } from '@angular/core'
import { ActivatedRoute, Params } from '@angular/router'
import { StoryService, AlertService } from '../../_services/index'
import { StoryDocument, StoryMetaData } from '../../_models/index'
import { AlertComponent } from '../../_directives/index'

@Component({
  selector: 'app-story-viewer',
  templateUrl: './story-viewer.component.html',
  styleUrls: ['./story-viewer.component.css']
})
export class StoryViewerComponent implements OnInit {
  private storyId: string
  private story: StoryMetaData
  private storyDoc: StoryDocument

  constructor(
    private storyService: StoryService,
    private alertService: AlertService,
    private activatedRoute: ActivatedRoute
  ) {
    this.story = <StoryMetaData>{
      title: "..."
    }
    this.storyDoc = new StoryDocument()
  }

  ngOnInit() {
    this.activatedRoute.params.subscribe((params: Params) => {
      this.storyId = params['story_id']
      this.refreshStory()
    })
  }

  refreshStory() {
    this.storyService.getStory(this.storyId).then((story: StoryMetaData) => {
      this.story = story
      this.storyService.setCurrentlyVievedStory(story)
    }).catch((error) => {
      this.alertService.error(error)
    })
  }
}
