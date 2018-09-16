import { Component, OnInit } from '@angular/core'
import { User, StoryMetaData } from './../../../_models'
import { StoryEditorService, AuthenticationService, AlertService, DynamicForm, FormValues, UIService } from './../../../_services'

@Component({
  selector: 'app-common-tools',
  template: `
  <div *ngIf="enabled" style="padding-top: 5px;">
    <button (click)="publishStory()" class="btn btn-primary" style="width: 100%">Story Settings</button>
  </div>`
})
export class StorySettingsComponent implements OnInit {
  private story: StoryMetaData = <StoryMetaData>{ storyId: "", accessibility: 'private' }
  private enabled: boolean

  constructor(
    private storyEditor: StoryEditorService,
    private authenticationService: AuthenticationService,
    private alertService: AlertService,
    private uiService: UIService
  ) { }

  ngOnInit() {
    this.enabled = false
    this.storyEditor.getCurrentStory().subscribe((story: StoryMetaData) => {
      if (story != undefined) {
        this.authenticationService.getCurrentUser().subscribe((user: User) => {
          if (user != undefined) {
            this.enabled = (user.id == story.authorId) ? true : false
            this.story = story
          }
        })
      } else {
        this.enabled = false
        this.story = <StoryMetaData>{ storyId: "", accessibility: 'private' }
      }
    })
  }

  publishStory() {
    let form: DynamicForm = new DynamicForm("Story Settings", "Apply")
    form.addTextInput('Title', 'title', this.story.title)
    form.addDropdown('Accessibility', 'accessibility', this.story.accessibility)
    .addDropdownEntry('public', 'Public')
    .addDropdownEntry('private', 'Private')
    form.addFileSelection('Thumbnail', 'thumbnail', { fileTypes: ['.png', '.jpg'], fileLimit: '1mb' })

    let onSubmit = (values: FormValues, closeForm, showError) => {
      let newStoryProperties = {
        title: values['title'],
        accessibility: values['accessibility']
      }

      let updateStory = () => {
        this.storyEditor.updateStory(newStoryProperties).then(() => {
          this.alertService.success('Story Updated!')
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
            newStoryProperties['thumbnail']  = base64String
            updateStory()
          }
          fileReader.readAsBinaryString(newThumbnail)
        } else {
          showError('Thumbnail file size too big')
          return
        }
      } else {
        updateStory()
      }
    }
    this.uiService.promptForm(form, false, onSubmit)
  }

}
