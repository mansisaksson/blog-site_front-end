import { Component, OnInit } from '@angular/core'
import { User, StoryMetaData } from './../../../_models'
import { StoryService, StoryEditorService, AuthenticationService, AlertService, DynamicForm, FormValues, UIService } from './../../../_services'
import { Router } from '@angular/router'

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
    private router: Router,
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

    let onSubmit = (values: FormValues, closeForm) => {
      let newStoryProperties = { 
        title: values['title'],
        accessibility: values['accessibility'] 
      }
      this.storyEditor.updateStory(newStoryProperties).then(() => {
        this.alertService.success('Story Updated!')
        closeForm()
      }).catch(e => this.alertService.error(e))
    }
    let on
    this.uiService.promptForm(form, false, onSubmit)
  }

}
