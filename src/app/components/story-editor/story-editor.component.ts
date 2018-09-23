import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core'
import { ActivatedRoute, Params } from '@angular/router'
import { StoryEditorService, StoryService, AlertService } from '../../_services'
import { StoryMetaData, ChapterMetaData } from '../../_models'

@Component({
  selector: 'app-story-editor',
  templateUrl: './story-editor.component.html',
  styleUrls: ['./story-editor.component.css']
})
export class StoryEditorComponent implements AfterViewInit, OnDestroy {
  public chapter: ChapterMetaData
  private storyId: string
  private story: StoryMetaData

  constructor(
    private alertService: AlertService,
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
            this.storyEditorService.editChapter(this.story.chapters[0].chapterId).subscribe((chapterMetaData: ChapterMetaData) => {
              if (chapterMetaData) {
                this.chapter = chapterMetaData
              } else {
                this.chapter = <ChapterMetaData>{
                  title: "..."
                }
              }
            })
          } else {
            this.alertService.error("This story has no chapters!")
          }
        })
    })
  }

  ngOnDestroy() {
    this.storyEditorService.destroyEditor()
  }

  onChapterTitleChanged(newTitle: string) {
    this.storyEditorService.updateChapterMetaData({ title: newTitle }).then(() => {
      this.alertService.success("Chapter Renamed!")
    }).catch(e => this.alertService.error(e))
  }
}
