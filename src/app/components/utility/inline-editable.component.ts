import { Component, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-inline-editable',
  templateUrl: './inline-editable.component.html',
  styleUrls: []
})
export class InlineEditorComponent {
  @ViewChild('content') contentContainer: ElementRef

  @Output() onEdit: EventEmitter<string> = new EventEmitter<string>()
  
  private btnText = "Edit"
  constructor() {

  }

  toggleEdit() {
    let elem = this.contentContainer.nativeElement
    if (!elem.isContentEditable) {
      this.btnText = "Save"
      elem.contentEditable = 'true'
      elem.focus()
    } else {
      let text = <string>elem.textContent
      text = text.replace(/(\r\n\t|\n|\r\t)/gm,"").trim() // Sanitize string
      this.onEdit.emit(text)
      this.btnText = "Edit"
      elem.contentEditable = 'false'
    }
    
  }
}
