import { Component, OnInit } from '@angular/core'
import { User, BlogPostMetaData } from '../../_models'
import { BlogPostService, BlogPostEditorService, AuthenticationService, AlertService } from '../../_services'
import { Router } from '@angular/router';

@Component({
  selector: 'app-common-tools',
  template: `
  <div *ngIf="enabled" style="padding-top: 5px;">
    <button (click)="editBlog()" class="btn btn-primary" style="width: 100%">Edit Blog Post</button>
  </div>`
})
export class EditBlogPostComponent implements OnInit {
  public enabled: boolean
  private blogPostId: string

  constructor(
    private BlogPostService: BlogPostService,
    private authenticationService: AuthenticationService,
    private alertService: AlertService,
    private router: Router
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

  editBlog() {
    if (this.enabled) {
      this.authenticationService.withLoggedInUser().then((user: User) => {
        this.router.navigate(['blog-post-editor/' + this.blogPostId])
      }).catch(e => {
        this.alertService.error(e)
      })
    }
  }

}
