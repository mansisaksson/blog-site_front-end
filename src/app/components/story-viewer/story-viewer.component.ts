import { Component, OnInit, Input } from '@angular/core'
import { ActivatedRoute, Params } from '@angular/router'
import { StoryService, AlertService } from '../../_services/index'
import { StoryChapter, StoryMetaData } from '../../_models/index'
import QuillDeltaToHtmlConverter = require('quill-delta-to-html');

@Component({
  selector: 'app-story-viewer',
  templateUrl: './story-viewer.component.html',
  styleUrls: ['./story-viewer.component.css']
})
export class StoryViewerComponent implements OnInit {
  private storyId: string
  private story: StoryMetaData

  constructor(
    private storyService: StoryService,
    private alertService: AlertService,
    private activatedRoute: ActivatedRoute
  ) {
    this.story = <StoryMetaData>{
      title: "..."
    }
  }

  ngOnInit() {
    this.activatedRoute.params.subscribe((params: Params) => {
      this.storyId = params['story_id']
      this.refreshStory()
    })
  }

  refreshStory() {
    this.storyService.getStory(this.storyId).then((story) => {
      this.story = story
      this.storyService.setCurrentlyViewedStory(story)
      this.storyService.getStoryChapters(story.storyURIs).then((chapters: StoryChapter[]) => {
        let storyHTML = ""
        let cfg = {};
        chapters.forEach((chapter: StoryChapter) => {
          storyHTML += '<div class="storyChapter">'
          storyHTML += '<h2>' + chapter.metaData.title + '</h2>'
          try {
            let deltaObject = JSON.parse(chapter.content)
            let converter = new QuillDeltaToHtmlConverter(deltaObject.ops, cfg)
            storyHTML += converter.convert()
          } catch {}
          storyHTML += '</div>'
        });
        document.getElementById('documentContainer').innerHTML = storyHTML;
      }).catch((e) => console.log(e))
    }).catch((e) => console.log(e))
  }

}
