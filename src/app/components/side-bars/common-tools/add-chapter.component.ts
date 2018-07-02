import { Component } from '@angular/core'
import { User } from './../../../_models'
import { AuthenticationService, AlertService, UIService, DynamicForm, FormValues, StoryEditorService } from './../../../_services'
import { Router } from '@angular/router';

@Component({
  selector: 'app-common-tools',
  template: `
  <div>
    <button (click)="addChapter()" class="btn btn-primary">Create New Chapter</button>
  </div>`
})
export class AddChapterComponent {

  constructor(
    private storyEditorService: StoryEditorService,
    private uiService: UIService,
    private authenticationService: AuthenticationService,
    private alertService: AlertService
  ) { }

  addChapter() {
    this.authenticationService.withLoggedInUser().then((user: User) => {
      let form: DynamicForm = new DynamicForm("Create Chapter", "Create!")
      form.addTextInput("Chapter Title", "chapter_title", "Chapter 1")
      this.uiService.promptForm('', form).then((values: FormValues) => {
        this.storyEditorService.createNewChapter(values["chapter_title"]).then(() => {
          this.alertService.success("Chapter added!")
          //this.router.navigate(['story-editor/'+story.storyId])
        }).catch(e => this.alertService.error(e))
      }).catch(e => this.alertService.error(e))
    }).catch(e => this.alertService.error(e))
  }

}
