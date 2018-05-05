import { Component, ElementRef, ViewChild, ViewEncapsulation, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Observable } from 'rxjs';

import { QuillEditorComponent } from 'ngx-quill/src/quill-editor.component';

import * as quill from 'quill';
let Quill: any = quill;

// add image resize module
import ImageResize from 'quill-image-resize-module';
Quill.register('modules/imageResize', ImageResize);

// add mention module
import 'quill-mention';

// override p with div tag
const Parchment = Quill.import('parchment');
let Block = Parchment.query('block');

Block.tagName = 'DIV';
// or class NewBlock extends Block {}; NewBlock.tagName = 'DIV';
Quill.register(Block /* or NewBlock */, true);

import Counter from './counter';
Quill.register('modules/counter', Counter)

// Add fonts to whitelist
var Font = Quill.import('formats/font');
// We do not add Aref Ruqaa since it is the default
Font.whitelist = ['mirza', 'aref', 'sans-serif', 'monospace', 'serif'];
Quill.register(Font, true);

@Component({
  selector: 'app-story-viewer',
  templateUrl: './story-viewer.component.html',
  styleUrls: [
    './story-viewer.component.css'
  ]
})
export class StoryViewerComponent implements OnInit {
  title = '<ul><li>I am example content</li><li><u>And this, too</u></li></ul>';
  isReadOnly = false;
  placeholder = 'placeholder';
  form: FormGroup;
  modules = {};

  constructor(fb: FormBuilder) {
    const values = [
      { id: 1, value: 'Fredrik Sundqvist' },
      { id: 2, value: 'Patrik Sjölin' }
    ];

    this.form = fb.group({
      editor: ['test']
    });

    this.modules = {
      formula: true,
      toolbar: [['formula'], ['image']],
      imageResize: {},
      mention: {
        allowedChars: /^[A-Za-z\sÅÄÖåäö]*$/,
        source: function (searchTerm) {
          if (searchTerm.length === 0) {
            this.renderList(values, searchTerm);
          } else {
            const matches = [];
            for (let i = 0; i < values.length; i++)
              if (~values[i].value.toLowerCase().indexOf(searchTerm)) matches.push(values[i]);
            this.renderList(matches, searchTerm);
          }
        },
      }
    }
  }
  
  @ViewChild('editor') editor: QuillEditorComponent

  ngOnInit() {
    this.form
      .controls
      .editor
      .valueChanges.pipe(
        debounceTime(400),
        distinctUntilChanged()
      )
      .subscribe(data => {
        console.log('native fromControl value changes with debounce', data)
      });

    this.editor
      .onContentChanged
      .pipe(
        debounceTime(400),
        distinctUntilChanged()
      )
      .subscribe(data => {
        console.log('view child + directly subscription', data)
      });
  }

  addBindingCreated(quill) {
    quill.keyboard.addBinding({
      key: 'B'
    }, (range, context) => {
      console.log('KEYBINDING B', range, context);
    });
  }

  setControl() {
    this.form.setControl('editor', new FormControl('test - new Control'))
  }

  setFocus($event) {
    $event.focus();
  }

  patchValue() {
    this.form.controls['editor'].patchValue(`${this.form.controls['editor'].value} patched!`)
  }

  toggleReadOnly() {
    this.isReadOnly = !this.isReadOnly;
  }

  logChange($event: any) {
    console.log($event);
  }

  logSelection($event: any) {
    console.log($event);
  }
}
