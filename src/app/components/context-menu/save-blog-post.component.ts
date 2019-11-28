import { Component, OnInit } from '@angular/core'
import { User, BlogPostMetaData } from '../../_models'
import { BlogPostEditorService, AuthenticationService, AlertService } from '../../_services'

@Component({
  selector: 'app-common-tools',
  template: `
  <div *ngIf="enabled" style="padding-top: 5px;">
    <button (click)="saveBlog()" class="btn btn-primary" style="width: 100%">Save Chapter</button>
  </div>`
})
export class SaveBlogPostComponent implements OnInit {
  public enabled: boolean
  private blogPost: BlogPostMetaData

  constructor(
    private blogEditorService: BlogPostEditorService,
    private authenticationService: AuthenticationService,
    private alertService: AlertService
  ) { }

  ngOnInit() {
    this.blogEditorService.getCurrentBlog().subscribe((blogPost: BlogPostMetaData) => {
      this.enabled = false;
      this.blogPost = blogPost;
      if (blogPost != undefined) {
        this.authenticationService.getCurrentUser().subscribe((user: User) => {
          if (user != undefined) {
            this.enabled = (user.id == blogPost.authorId) ? true : false
          }
        })
      } else {
        this.enabled = false
      }
    })
  }

  saveBlog() {
    if (this.enabled) {
      this.authenticationService.withLoggedInUser().then((user: User) => {
        if (this.blogPost != undefined) {
          this.blogEditorService.saveCurrentChapter().then(() => {
            this.alertService.success("Chapter saved!")
          }).catch(e => this.alertService.error(e))
        } else {
          this.alertService.error("No Valid blogPost post currently being edited")
        }
      }).catch(e => {
        this.alertService.error(e)
      })
    }
  }

}
