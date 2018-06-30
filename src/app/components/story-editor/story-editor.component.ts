import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core'
import { ActivatedRoute, Params } from '@angular/router'
import { StoryEditorService, StoryService } from '../../_services'
import { StoryDocument, StoryMetaData } from '../../_models'

@Component({
  selector: 'app-story-editor',
  templateUrl: './story-editor.component.html',
  styleUrls: ['./story-editor.component.css']
})
export class StoryEditorComponent implements AfterViewInit, OnDestroy {
  private storyId: string
  private story: StoryMetaData
  private currentURI: string = ""

  constructor(
    private storyService: StoryService,
    private storyEditorService: StoryEditorService,
    private activatedRoute: ActivatedRoute) {
    this.story = <StoryMetaData>{
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
            this.storyEditorService.editDocument(this.currentURI)
          }
        })
    })
  }

  ngOnDestroy() {
    this.storyEditorService.destroyEditor()
  }

  addBindingCreated(quill) {
    quill.keyboard.addBinding({
      key: 'S',
      ctrlKey: true
    }, (range, context) => {
      //this.storyEditorService.updateStoryDocument()
      console.log('Save!', range, context)
    })
  }
}
