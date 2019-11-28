import { Component, OnInit } from '@angular/core'
import { User, BlogPostMetaData } from '../../_models'
import { BlogPostService, AuthenticationService, AlertService, UIService, DynamicForm, FormValues } from '../../_services'
import { Router } from '@angular/router';

@Component({
  selector: 'app-common-tools',
  template: `
  <div *ngIf="enabled" style="padding-top: 5px;">
    <button (click)="deleteBlogPost()" class="btn btn-primary" style="width: 100%">Delete Blog Post</button>
  </div>`
})
export class DeleteBlogPostComponent implements OnInit {
  public enabled: boolean
  private blogPostId: string

  constructor(
    private router: Router,
    private uiService: UIService,
    private BlogPostService: BlogPostService,
    private authenticationService: AuthenticationService,
    private alertService: AlertService
  ) { }

  ngOnInit() {
    this.enabled = false;
    this.BlogPostService.getCurrentlyViewedBlogPost().subscribe((blogPost: BlogPostMetaData) => {
      if (blogPost != undefined) {
        this.authenticationService.getCurrentUser().subscribe((user: User) => {
          if (user != undefined) {
            this.enabled = (user.id == blogPost.authorId) ? true : false
            this.blogPostId = blogPost.storyId
          }
        })
      } else {
        this.enabled = false
        this.blogPostId = ""
      }
    })
  }

  deleteBlogPost() {
    if (this.enabled) {
      this.authenticationService.withLoggedInUser().then((user: User) => {
        let form: DynamicForm = new DynamicForm("Delete Blog Post", "Delete")
        form.addTextInput("Type DELETE", "delete", { multiline: false }, "")

        let onSubmit = (values: FormValues) => {
          if (values["delete"] === "DELETE") {
            this.BlogPostService.deleteBlogPost(this.blogPostId).then(() => {
              this.router.navigate([''])
            }).catch(e => {
              this.alertService.error(e)
            })
          } else {
            this.alertService.error("Invalid verification string")
          }
        }
        this.uiService.promptForm(form, true, onSubmit)
      }).catch(e => {
        this.alertService.error(e)
      })
    }
  }

}
