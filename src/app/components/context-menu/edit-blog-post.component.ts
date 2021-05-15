import { Component, OnInit } from '@angular/core'
import { User, BlogPostMetaData } from '../../_models'
import { BlogPostService, BlogPostEditorService, AuthenticationService, AlertService } from '../../_services'
import { Router } from '@angular/router';

@Component({
  selector: 'app-common-tools',
  template: `
  <div *ngIf="isEnabled()" style="padding-top: 5px;">
    <button (click)="editBlog()" class="btn btn-primary" style="width: 100%">Edit Blog Post</button>
  </div>`
})
export class EditBlogPostComponent implements OnInit {
  private blogPost: BlogPostMetaData = BlogPostMetaData.EmptyBlogPost;
  private currentUser: User = User.EmptyUser

  constructor(
    private BlogPostService: BlogPostService,
    private authenticationService: AuthenticationService,
    private alertService: AlertService,
    private router: Router
  ) { }

  ngOnInit() {
    this.BlogPostService.getCurrentlyViewedBlogPost().subscribe((blogPost: BlogPostMetaData) => this.blogPost = blogPost);
    this.authenticationService.getCurrentUser().subscribe((user: User) => this.currentUser = user);
  }

  isEnabled(): boolean {
    return this.currentUser != undefined && this.blogPost != undefined
      && this.blogPost.authorId != "" && this.currentUser.id == this.blogPost.authorId;
  }

  async editBlog() {
    if (!this.isEnabled()) {
      return;
    }
    try {
      await this.authenticationService.ensureWithLoggedInUser();
      this.router.navigate(['edit/' + this.blogPost.storyId]);
    } catch (error) {
      this.alertService.error(error)
    }
  }

}
