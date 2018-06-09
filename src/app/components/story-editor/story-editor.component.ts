import { Component, ElementRef, ViewEncapsulation, OnInit, AfterViewInit, ViewChildren, QueryList } from '@angular/core'
import { ActivatedRoute, Params } from '@angular/router'
import { debounceTime, distinctUntilChanged } from 'rxjs/operators'
import { StoryEditorService, AlertService } from '../../_services'
import { StoryDocument, StoryMetaData } from '../../_models'

import { QuillEditorComponent } from 'ngx-quill/src/quill-editor.component'

import * as quill from 'quill'
let Quill: any = quill // due to a bug in Quill we have to declare the import as an any

// add image resize module
import ImageResize from 'quill-image-resize-module'
Quill.register('modules/imageResize', ImageResize)

// add mention module
import 'quill-mention'

// override p with div tag
const Parchment = Quill.import('parchment')
let Block = Parchment.query('block')

Block.tagName = 'DIV'
// or class NewBlock extends Block {}; NewBlock.tagName = 'DIV'
Quill.register(Block /* or NewBlock */, true)

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
  private storyDocs: StoryDocument[] = []

  constructor(
    private storyEditorService: StoryEditorService,
    private alertService: AlertService,
    private activatedRoute: ActivatedRoute) {
    this.story = <StoryMetaData>{
      title: "..."
    }
    this.storyDocs.push(new StoryDocument())
    this.storyDocs.push(new StoryDocument())
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
        debounceTime(400),
        distinctUntilChanged()
      ).subscribe(data => {
        this.storyEditorService.updateDocumentContent(this.story.storyURIs[index], data.html)
      })
    })
  }

  refreshStory() {
    this.storyEditorService.loadStory(this.storyId).then((story) => {
      this.story = story;
    })
  }

  setFocus($event) {
    $event.focus()
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
