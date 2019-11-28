import { Component, OnInit } from '@angular/core'
import { User, BlogPostMetaData } from '../../_models'
import { BlogPostEditorService, AuthenticationService, AlertService, DynamicForm, FormValues, UIService } from '../../_services'

@Component({
  selector: 'app-common-tools',
  template: `
  <div *ngIf="enabled" style="padding-top: 5px;">
    <button (click)="publishBlog()" class="btn btn-primary" style="width: 100%">Blog Post Settings</button>
  </div>`
})
export class BlogPostSettingsComponent implements OnInit {
  public enabled: boolean
  private blogPost: BlogPostMetaData = <BlogPostMetaData>{ storyId: "", accessibility: 'private' }

  constructor(
    private blogEditor: BlogPostEditorService,
    private authenticationService: AuthenticationService,
    private alertService: AlertService,
    private uiService: UIService
  ) { }

  ngOnInit() {
    this.enabled = false
    this.blogEditor.getCurrentBlog().subscribe((blogPost: BlogPostMetaData) => {
      if (blogPost != undefined) {
        this.authenticationService.getCurrentUser().subscribe((user: User) => {
          if (user != undefined) {
            this.enabled = (user.id == blogPost.authorId) ? true : false
            this.blogPost = blogPost
          }
        })
      } else {
        this.enabled = false
        this.blogPost = <BlogPostMetaData>{ storyId: "", accessibility: 'private' }
      }
    })
  }

  publishBlog() {
    let form: DynamicForm = new DynamicForm("Blog Post Settings", "Apply")
    form.addTextInput('Title', 'title', { multiline: false }, this.blogPost.title)
    form.addTextInput('Description', 'description', { multiline: true, rows: 4, charLimit: 500 }, this.blogPost.description)
    form.addDropdown('Accessibility', 'accessibility', this.blogPost.accessibility)
    .addDropdownEntry('public', 'Public')
    .addDropdownEntry('private', 'Private')
    form.addFileSelection('Thumbnail', 'thumbnail', { fileTypes: ['.png'], fileLimit: '1mb' })

    let onSubmit = (values: FormValues, closeForm, showError) => {
      let newBlogProperties = {
        title: values['title'],
        description: values['description'],
        accessibility: values['accessibility']
      }

      let updateBlogPost = () => {
        this.blogEditor.updateBlogPost(newBlogProperties).then(() => {
          this.alertService.success('Blog Post Updated!')
          closeForm()
        }).catch(e => {
          this.alertService.error(e)
          closeForm()
        })
      }

      // Set thumbnail property
      let newThumbnail = <File>values['thumbnail']
      if (newThumbnail) {
        let fileSize = newThumbnail.size / 1024 / 1024 // in MB
        if (fileSize <= 2) {
          let fileReader = new FileReader()
          fileReader.onload = (e) => {
            let base64String = btoa(<string>fileReader.result)
            newBlogProperties['thumbnail']  = base64String
            updateBlogPost()
          }
          fileReader.readAsBinaryString(newThumbnail)
        } else {
          showError('Thumbnail file size too big')
          return
        }
      } else {
        updateBlogPost()
      }
    }
    this.uiService.promptForm(form, false, onSubmit)
  }

}
