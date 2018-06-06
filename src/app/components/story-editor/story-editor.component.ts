import { Component, ElementRef, ViewChild, ViewEncapsulation, OnInit } from '@angular/core'
import { ActivatedRoute, Params } from '@angular/router'
import { debounceTime, distinctUntilChanged } from 'rxjs/operators'
import { StoryService, AlertService } from '../../_services'
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
export class StoryEditorComponent implements OnInit {
  private storyId: string
  private story: StoryMetaData
  private storyDocs: StoryDocument[] = []

  constructor(
    private storyService: StoryService,
    private alertService: AlertService,
    private activatedRoute: ActivatedRoute) {
      this.story = <StoryMetaData>{
        title: "..."
      }
      this.storyDocs.push(new StoryDocument())
      this.storyDocs.push(new StoryDocument())
  }

  @ViewChild('editor') editor: QuillEditorComponent

  ngOnInit() {
    // this.editor.onContentChanged.pipe(
    //   debounceTime(400),
    //   distinctUntilChanged()
    // ).subscribe(data => {
    //   console.log(data)
    // })

    this.activatedRoute.params.subscribe((params: Params) => {
      this.storyId = params['story_id'];
      this.refreshStory()
    })
  }

  refreshStory() {
    this.storyService.getStory(this.storyId).then((story: StoryMetaData) => {
      this.story = story
      this.storyService.setCurrentlyVievedStory(story)

      this.storyService.getStoryDocument(story.storyURIs[0]).then((storyDoc: StoryDocument) => {
        //this.storyDocs.push(storyDoc)
      }).catch(error => {
        this.alertService.error(error)
      })

    }).catch((error) => {
      this.alertService.error(error)
    })
  }

  setFocus($event) {
    $event.focus()
  }

  getContent() {
    // this.editor.quillEditor <-- quill.Quill()
    //return this.editor.quillEditor.getContents()
  }

  addBindingCreated(quill) {
    quill.keyboard.addBinding({
      key: 'S',
      ctrlKey: true
    }, (range, context) => {
      console.log('Save!', range, context)
    })
  }
}
