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
  private storyId: string
  private enabled: boolean

  constructor(
    private storyService: StoryService,
    private authenticationService: AuthenticationService,
    private alertService: AlertService,
    private router: Router,
    private uiService: UIService
  ) { }

  ngOnInit() {
    this.enabled = false
    this.storyService.getCurrentlyViewedStory().subscribe((story: StoryMetaData) => {
      if (story != undefined) {
        this.authenticationService.getCurrentUser().subscribe((user: User) => {
          if (user != undefined) {
            this.enabled = (user.id == story.authorId) ? true : false
            this.storyId = story.storyId
          }
        })
      } else {
        this.enabled = false
        this.storyId = ""
      }
    })
  }

  publishStory() {
    let form: DynamicForm = new DynamicForm("Story Settings", "Apply")
    form.addDropdown('Accessibility', 'accessibility_dropdown', 'public')
    .addDropdownEntry('public', 'Public')
    .addDropdownEntry('private', 'Private')

    let onSubmit = (values: FormValues) => {
      
    }
    this.uiService.promptForm(form, true, onSubmit)
  }

}
