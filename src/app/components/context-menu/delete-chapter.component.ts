import { Component } from '@angular/core'
import { User } from '../../_models'
import { AuthenticationService, AlertService, UIService, DynamicForm, FormValues, BlogPostEditorService } from '../../_services'

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
    private blogEditorService: BlogPostEditorService,
    private authenticationService: AuthenticationService,
    private alertService: AlertService
  ) { }

  async deleteChapter(): Promise<void> {
    try {
      await this.authenticationService.ensureWithLoggedInUser();

      let form: DynamicForm = new DynamicForm("Delete Chapter", "Delete");
      form.addTextInput("Type DELETE", "delete", { multiline: false }, "");

      let onFormSubmit = async (values: FormValues) => {
        if (values["delete"] === "DELETE") {
          try {
            await this.blogEditorService.deleteCurrentChapter();
            this.alertService.success("Chapter Deleted!");
          } catch (error) {
            this.alertService.error(error);
          }
        } else {
          this.alertService.error("Invalid verification string");
        }
      }
      this.uiService.promptForm(form, true, onFormSubmit);
    } catch (error) {
      this.alertService.error(error);
    }
  }

}
