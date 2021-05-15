import { Component, OnInit } from '@angular/core'
import { User, BlogPostMetaData } from '../../_models'
import { BlogPostEditorService, AuthenticationService, AlertService } from '../../_services'

@Component({
  selector: 'app-common-tools',
  template: `
  <div *ngIf="isEnabled()" style="padding-top: 5px;">
    <button (click)="saveBlog()" class="btn btn-primary" style="width: 100%">Save Chapter</button>
  </div>`
})
export class SaveBlogPostComponent implements OnInit {
  private blogPost: BlogPostMetaData = BlogPostMetaData.EmptyBlogPost;
  private currentUser: User = User.EmptyUser

  constructor(
    private blogEditorService: BlogPostEditorService,
    private authenticationService: AuthenticationService,
    private alertService: AlertService
  ) { }

  ngOnInit() {
    this.blogEditorService.getCurrentBlog().subscribe((blogPost: BlogPostMetaData) => this.blogPost = blogPost);
    this.authenticationService.getCurrentUser().subscribe((user: User) => this.currentUser = user);
  }

  isEnabled(): boolean {
    return this.currentUser != undefined && this.blogPost != undefined
      && this.blogPost.authorId != "" && this.currentUser.id == this.blogPost.authorId;
  }

  async saveBlog(): Promise<void> {
    if (!this.isEnabled()) {
      return;
    }

    try {
      await this.authenticationService.ensureWithLoggedInUser();
      
      if (this.blogPost != undefined) {
        await this.blogEditorService.saveCurrentChapter();
        this.alertService.success("Chapter saved!");
      } else {
        this.alertService.error("No Valid blogPost post currently being edited");
      }
    } catch (error) {
      this.alertService.error(error);
    }
  }

}
