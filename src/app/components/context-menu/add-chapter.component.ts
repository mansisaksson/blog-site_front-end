import { Component } from '@angular/core'
import { User, BlogPostMetaData } from '../../_models'
import { AuthenticationService, AlertService, UIService, DynamicForm, FormValues, BlogPostEditorService } from '../../_services'

@Component({
  selector: 'app-common-tools',
  template: `
  <div style="padding-top: 5px;">
    <button (click)="addChapter()" class="btn btn-primary" style="width: 100%">Create New Chapter</button>
  </div>`
})
export class AddChapterComponent {

  constructor(
    private blogEditorService: BlogPostEditorService,
    private uiService: UIService,
    private authenticationService: AuthenticationService,
    private alertService: AlertService
  ) { }

  async addChapter() {
    try {
      await this.authenticationService.ensureWithLoggedInUser();
      let form: DynamicForm = new DynamicForm("Create Chapter", "Create!");
      form.addTextInput("Chapter Title", "chapter_title", { multiline: false }, "Chapter 1");
      let onFormSubmit = async (values: FormValues) => {
        try {
          let newChapter: BlogPostMetaData = await this.blogEditorService.createNewChapter(values["chapter_title"]);
          if (newChapter) {
            this.alertService.success("Chapter added!");
          }
          else {
            this.alertService.error("Failed to add chapter!");
          }  
        } catch (error) {
          this.alertService.error(error);
        }
      }
      this.uiService.promptForm(form, true, onFormSubmit);
    } catch (error) {
      this.alertService.error(error)
    }
  }

}
