import { Component } from '@angular/core'
import { User, BlogPostMetaData } from '../../_models'
import { BlogPostService, AuthenticationService, AlertService, UIService, DynamicForm, FormValues } from '../../_services'
import { Router } from '@angular/router';

@Component({
  selector: 'app-common-tools',
  template: `
  <div style="padding-top: 5px;">
    <button (click)="createBlogPost()" class="btn btn-primary" style="width: 100%">Create New Blog Post</button>
  </div>`
})
export class CreateBlogPostComponent {

  constructor(
    private router: Router,
    private BlogPostService: BlogPostService,
    private uiService: UIService,
    private authenticationService: AuthenticationService,
    private alertService: AlertService
  ) { }

  async createBlogPost() {
    try {
      let user: User = await this.authenticationService.withLoggedInUser();
      let form: DynamicForm = new DynamicForm("Create Blog", "Create!");
      form.addTextInput("Blog Post Title", "title", { multiline: false }, "Title Here");
      form.addTextInput("Chapter 1 Title", "chapter_title", { multiline: false }, "Chapter 1");

      let onFormSubmit = async (values: FormValues) => {
        try {
          let blogPost: BlogPostMetaData = await this.BlogPostService.createBlogPost(user.id, values["title"], values["chapter_title"]);
          this.router.navigate(['edit/'+blogPost.storyId]);
        } catch (error) {
          this.alertService.error(error);
        }
      }
      this.uiService.promptForm(form, true, onFormSubmit);
    } catch (error) {
      this.alertService.error(error);
    }
  }
}
