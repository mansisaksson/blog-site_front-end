import { Component } from '@angular/core'
import { User } from './../../../_models'
import { AuthenticationService, AlertService, UIService, DynamicForm, FormValues, StoryEditorService } from './../../../_services'

@Component({
  selector: 'app-common-tools',
  template: `
  <div style="padding-top: 5px;">
    <button (click)="deleteChapter()" class="btn btn-primary" style="width: 100%">Delete Chapter</button>
  </div>`
})
export class DeleteChapterComponent {
  constructor(
    private uiService: UIService,
    private storyEditorService: StoryEditorService,
    private authenticationService: AuthenticationService,
    private alertService: AlertService
  ) { }

  deleteChapter() {
    this.authenticationService.withLoggedInUser().then((user: User) => {
      let form: DynamicForm = new DynamicForm("Delete Chapter", "Delete")
      form.addTextInput("Type DELETE", "delete", "")

      this.uiService.promptForm('', form).then((entries: FormValues) => {
        if (entries["delete"] === "DELETE") {
          this.storyEditorService.deleteCurrentChapter().then(() => {
            this.alertService.success("Chapter Deleted!")
          }).catch(e => this.alertService.error(e))
        } else {
          this.alertService.error("Invalid verification string")
        }
      })

    }).catch(e => {
      this.alertService.error(e)
    })
  }

}
