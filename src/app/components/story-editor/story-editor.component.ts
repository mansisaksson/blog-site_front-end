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

  constructor(
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
        '#scrolling-container').then((story: StoryMetaData) => {
          this.story = story
          if (story && this.story.chapters.length > 0) {
            this.storyEditorService.editChapter(this.story.chapters[0].URI).subscribe((chapterMetaData: ChapterMetaData) => {
              if (chapterMetaData) {
                this.chapter = chapterMetaData  
              } else {
                this.chapter = <ChapterMetaData>{
                  title: "..."
                }
              }
            })
          } else {
            
          }
        })
    })
  }

  ngOnDestroy() {
    this.storyEditorService.destroyEditor()
  }

  onTitleChanged(newTitle: string) {
    console.log(newTitle)
  }

}
