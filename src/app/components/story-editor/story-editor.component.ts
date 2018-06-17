import { Component, ElementRef, ViewEncapsulation, OnInit, AfterViewInit, ViewChildren, QueryList } from '@angular/core'
import { ActivatedRoute, Params } from '@angular/router'
import { debounceTime, distinctUntilChanged } from 'rxjs/operators'
import { StoryEditorService, AlertService, StoryService} from '../../_services'
import { StoryDocument, StoryMetaData } from '../../_models'

import { QuillEditorComponent } from 'ngx-quill/src/quill-editor.component'

import * as quill from 'quill'
let Quill: any = quill // due to a bug in Quill we have to declare the import as an any

/*
 TODO: 
 "Quill.register('modules/imageResize', ImageResize)"
 is called in image-resize.min.js which causes a double register, it seams to work anyways but it causes a warning.
 */
// add image resize module
import ImageResize from 'quill-image-resize-module'
Quill.register('modules/imageResize', ImageResize)

import Counter from './counter'
Quill.register('modules/counter', Counter)

// Add fonts to whitelist
var Font = Quill.import('formats/font')
// We do not add Aref Ruqaa since it is the default
Font.whitelist = ['mirza', 'aref', 'sans-serif', 'monospace', 'serif']
Quill.register(Font, true)

@Component({
  selector: 'app-story-editor',
  templateUrl: './story-editor.component.html',
  styleUrls: ['./story-editor.component.css']
})
export class StoryEditorComponent implements OnInit, AfterViewInit {
  private storyId: string
  private story: StoryMetaData
  private storyDocs: { [key: string]: StoryDocument } = {}
  private uriKeys: string[] = []

  constructor(
    private storyService: StoryService,
    private storyEditorService: StoryEditorService,
    private alertService: AlertService,
    private activatedRoute: ActivatedRoute) {
    this.story = <StoryMetaData>{
      title: "..."
    }
  }

  @ViewChildren(QuillEditorComponent) editors: QueryList<QuillEditorComponent>

  ngOnInit() {
    this.activatedRoute.params.subscribe((params: Params) => {
      this.storyId = params['story_id'];
      this.refreshStory()
    })
  }

  ngAfterViewInit() {
    this.editors.changes.subscribe((any) => {
      this.subscribeToChanges()
    })
    this.subscribeToChanges()
  }

  subscribeToChanges() {
    this.editors.forEach((editor, index) => {
      editor.onContentChanged.pipe(
        debounceTime(500),
        distinctUntilChanged()
      ).subscribe(() => {
        let uri = this.story.storyURIs[index]
        //console.log(this.storyDocs[uri])
        this.storyEditorService.updateDocument(this.story.storyURIs[index], this.storyDocs[uri])
      })
    })
  }

  refreshStory() {
    this.storyEditorService.loadStory(this.storyId).then((story) => {
      this.story = story;
      this.storyService.setCurrentlyViewedStory(story)
      if (story) {
        story.storyURIs.forEach((uri, index) => {
          this.storyEditorService.getStoryDocument(uri).subscribe((doc) => {
            if (doc == undefined) {
              delete this.storyDocs[uri]
            } else {
              this.storyDocs[uri] = doc
            }
            this.uriKeys = Object.keys(this.storyDocs);
          })
        })
      }
    })
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
