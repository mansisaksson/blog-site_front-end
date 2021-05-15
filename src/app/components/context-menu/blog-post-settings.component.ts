import { Component, OnInit } from '@angular/core'
import { User, BlogPostMetaData } from '../../_models'
import { BlogPostEditorService, AuthenticationService, AlertService, DynamicForm, FormValues, UIService } from '../../_services'

@Component({
  selector: 'app-common-tools',
  template: `
  <div *ngIf="isEnabled()" style="padding-top: 5px;">
    <button (click)="publishBlog()" class="btn btn-primary" style="width: 100%">Blog Post Settings</button>
  </div>`
})
export class BlogPostSettingsComponent implements OnInit {
  private blogPost: BlogPostMetaData = BlogPostMetaData.EmptyBlogPost;
  private currentUser: User = User.EmptyUser

  constructor(
    private blogEditor: BlogPostEditorService,
    private authenticationService: AuthenticationService,
    private alertService: AlertService,
    private uiService: UIService
  ) { }

  ngOnInit() {
    this.blogEditor.getCurrentBlog().subscribe((blogPost: BlogPostMetaData) => this.blogPost = blogPost);
    this.authenticationService.getCurrentUser().subscribe((user: User) => this.currentUser = user);
  }

  isEnabled(): boolean {
    return this.currentUser != undefined && this.blogPost != undefined
      && this.blogPost.authorId != "" && this.currentUser.id == this.blogPost.authorId;
  }

  publishBlog(): void {
    let form: DynamicForm = new DynamicForm("Blog Post Settings", "Apply");
    form.addTextInput('Title', 'title', { multiline: false }, this.blogPost.title);
    form.addTextInput('Description', 'description', { multiline: true, rows: 4, charLimit: 500 }, this.blogPost.description);
    form.addTextInput('Friendly URL', 'friendlyId', { multiline: false, charLimit: 50 }, this.blogPost.friendlyId);

    form.addDropdown('Accessibility', 'accessibility', this.blogPost.accessibility)
      .addDropdownEntry('public', 'Public')
      .addDropdownEntry('private', 'Private');
    form.addFileSelection('Thumbnail', 'thumbnail', { fileTypes: ['.png'], fileLimit: '1mb' });
    form.addFileSelection('Banner', 'banner', { fileTypes: ['.png'], fileLimit: '1mb' });
    form.addTextInput('Tags', 'tags', { multiline: false, charLimit: 500 }, this.blogPost.tags.join(';'));

    let onSubmit = async (values: FormValues, closeForm, showError) => {
      let newBlogProperties = {
        title: values['title'],
        description: values['description'],
        accessibility: values['accessibility'],
        friendlyId: values['friendlyId'],
        tags: Array.from(new Set(values['tags'].split(';')))
      }

      function getImageData(file: File): Promise<string> {
        return new Promise<string>((resolve) => {
          if (file) {
            let fileReader = new FileReader();
            fileReader.onload = (e) => {
              resolve(btoa(<string>fileReader.result));
            }
            fileReader.readAsBinaryString(file);
          } else {
            resolve(undefined);
          }
        })
      }

      newBlogProperties['thumbnail'] = await getImageData(<File>values['thumbnail'])
      newBlogProperties['banner'] = await getImageData(<File>values['banner'])

      try {
        let blogPost: BlogPostMetaData = await this.blogEditor.updateBlogPost(newBlogProperties);
        if (blogPost) {
          this.alertService.success('Blog Post Updated!');
        } else {
          this.alertService.error('Failed to update blog post!');
        }
      } catch (error) {
        this.alertService.error(error);
      }
    }
    this.uiService.promptForm(form, false, onSubmit);
  }
}
