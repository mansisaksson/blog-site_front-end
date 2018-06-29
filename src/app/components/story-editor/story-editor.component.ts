import { Component, OnInit, AfterViewInit } from '@angular/core'
import { ActivatedRoute, Params } from '@angular/router'
import { StoryEditorService, AlertService, StoryService} from '../../_services'
import { StoryDocument, StoryMetaData } from '../../_models'

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
  private editor : quill.Quill;
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

  ngOnInit() {
    this.activatedRoute.params.subscribe((params: Params) => {
      this.storyId = params['story_id'];
      this.refreshStory()
    })
  }

  ngAfterViewInit() {
    this.editor = new Quill('#quillEditor', {
      modules: { toolbar: { container: '#quill-toolbar' }, imageResize: {} },
      scrollingContainer: '#scrolling-container',
      theme: 'snow'
    });

    let test : quill.DeltaStatic
    this.editor.setContents(test) // TODO: Set proper content

    this.subscribeToChanges()
  }

  subscribeToChanges() {
      this.editor.on("text-change", (content) => {
        console.log(content)
        
        // TODO: Move quill editor into story-editor.service and expose some helper functions.
        // I'm not sure weather the quill editor should be owned by the story editor service.
        // This means that I would have a unified way of interacting with the edited document.
        // Right now I am keeping copies and am working with a propriatary format
        // Maybe allowing the editor to be owned by the service is a better idea.

        // The problem is that I would be letting the service handle UI (creating and displaying the editor)
        // but that might be ok, after all, the alert service handles some UI of its own. So does the login/register services
        let uri = this.story.storyURIs[0]
        this.storyEditorService.updateDocument(uri, this.storyDocs[uri]) 
        
      // editor.onContentChanged.pipe(
      //   debounceTime(500),
      //   distinctUntilChanged()
      // ).subscribe(() => {
      //   let quillEditor = <quill.Quill>editor.quillEditor;
      //   console.log(quillEditor.getContents()) // <--- use this?
      //   let uri = this.story.storyURIs[index]
      //   //console.log(this.storyDocs[uri])
      //   this.storyEditorService.updateDocument(this.story.storyURIs[index], this.storyDocs[uri])
      // })
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
