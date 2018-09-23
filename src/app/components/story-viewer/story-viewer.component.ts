import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core'
import { ActivatedRoute, Params } from '@angular/router'
import { StoryService, AlertService } from '../../_services/index'
import { ChapterContent, StoryMetaData, ChapterMetaData } from '../../_models/index'

import * as Quill from 'quill'

@Component({
  selector: 'app-story-viewer',
  templateUrl: './story-viewer.component.html',
  styleUrls: ['./story-viewer.component.css']
})
export class StoryViewerComponent implements OnInit {
  private tempStory = <StoryMetaData>{
    title: "...",
    chapters: []
  }
  public story: StoryMetaData = this.tempStory
  private storyId: string

  constructor(
    private storyService: StoryService,
    private alertService: AlertService,
    private activatedRoute: ActivatedRoute
  ) { }

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

      if (!this.story) {
        this.story = this.tempStory
      }

      setTimeout(() => { // One frame delay to let the html update
        let chapterURIs = story.chapters.map(a => a.URI)
        this.storyService.getChapterContents(chapterURIs).then((contents: ChapterContent[]) => {
          var options = {
            modules: {
              toolbar: ''
            },
            placeholder: 'Nothing here yet...',
            readOnly: true,
            theme: 'bubble'
          }
          story.chapters.forEach((chapter: ChapterMetaData) => {
            try {
              var editor = new Quill('#' + 'quill_content_' + chapter.chapterId, options)
              let content = contents.find(a => { return chapter.URI == a.URI })
              editor.setContents(JSON.parse(content.content))
            } catch { }
          })
  
        }).catch((e) => console.log(e))
      }, 0)
    }).catch((e) => console.log(e))
  }

}
