import { Component, OnInit } from '@angular/core'
import { User, BlogPostMetaData } from '../../_models'
import { BlogPostService, AuthenticationService, AlertService, UIService, DynamicForm, FormValues } from '../../_services'
import { Router } from '@angular/router';

@Component({
  selector: 'app-common-tools',
  template: `
  <div *ngIf="isEnabled()" style="padding-top: 5px;">
    <button (click)="deleteBlogPost()" class="btn btn-primary" style="width: 100%">Delete Blog Post</button>
  </div>`
})
export class DeleteBlogPostComponent implements OnInit {
  private blogPost: BlogPostMetaData = BlogPostMetaData.EmptyBlogPost;
  private currentUser: User = User.EmptyUser

  constructor(
    private router: Router,
    private uiService: UIService,
    private BlogPostService: BlogPostService,
    private authenticationService: AuthenticationService,
    private alertService: AlertService
  ) { }

  ngOnInit() {
    this.BlogPostService.getCurrentlyViewedBlogPost().subscribe((blogPost: BlogPostMetaData) => this.blogPost = blogPost);
    this.authenticationService.getCurrentUser().subscribe((user: User) => this.currentUser = user);
  }

  isEnabled(): boolean {
    return this.currentUser != undefined && this.blogPost != undefined
      && this.blogPost.authorId != "" && this.currentUser.id == this.blogPost.authorId;
  }

  async deleteBlogPost(): Promise<void> {
    if (!this.isEnabled()) {
      return;
    }

    try {
      await this.authenticationService.ensureWithLoggedInUser();

      let form: DynamicForm = new DynamicForm("Delete Blog Post", "Delete")
      form.addTextInput("Type DELETE", "delete", { multiline: false }, "")

      let onSubmit = async (values: FormValues) => {
        if (values["delete"] === "DELETE") {
          try {
            await this.BlogPostService.deleteBlogPost(this.blogPost.storyId)
            this.router.navigate([''])
          } catch (error) {
            this.alertService.error(error)
          }
        } else {
          this.alertService.error("Invalid verification string")
        }
      }
      this.uiService.promptForm(form, true, onSubmit);

    } catch (error) {
      this.alertService.error(error)
    }
  }

}
