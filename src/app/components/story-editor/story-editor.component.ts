import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core'
import { ActivatedRoute, Params } from '@angular/router'
import { StoryEditorService, StoryService } from '../../_services'
import { StoryChapter, StoryMetaData, ChapterMetaData } from '../../_models'

@Component({
  selector: 'app-story-editor',
  templateUrl: './story-editor.component.html',
  styleUrls: ['./story-editor.component.css']
})
export class StoryEditorComponent implements AfterViewInit, OnDestroy {
  private storyId: string
  private story: StoryMetaData
  private chapter: ChapterMetaData
  private currentURI: string = ""

  constructor(
    private storyService: StoryService,
    private storyEditorService: StoryEditorService,
    private activatedRoute: ActivatedRoute) {
    
      // Default values to avout NULL reads
    this.story = <StoryMetaData>{
      title: "..."
    }
    this.chapter = <ChapterMetaData>{
      title: "..."
    }
  }

  ngAfterViewInit() {
    this.activatedRoute.params.subscribe((params: Params) => {
      this.storyId = params['story_id'];
      this.storyEditorService.createEditor(this.storyId,
        '#quillEditor',
        '#quill-toolbar',
        '#scrolling-container').then((story) => {
          this.story = story
          if (story) {
            this.currentURI = story.storyURIs[0]
            this.storyEditorService.editChapter(this.currentURI).then((chapterMetaData: ChapterMetaData) => {
              this.chapter = chapterMetaData
            })
          }
        })
    })
  }

  ngOnDestroy() {
    this.storyEditorService.destroyEditor()
  }

}
