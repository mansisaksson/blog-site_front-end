import { Component } from '@angular/core'
import { User, StoryMetaData } from './../../../_models'
import { StoryService, AuthenticationService, AlertService } from './../../../_services'

@Component({
  selector: 'app-common-tools',
  template: `
  <div>
    <button (click)="createStory()" class="btn btn-primary">Create New Story</button>
  </div>`
})
export class CreateStoryComponent {

  constructor(
    private storyService: StoryService,
    private authenticationService: AuthenticationService,
    private alertService: AlertService
  ) { }

  createStory() {
    this.authenticationService.withLoggedInUser().then((user: User) => {
      this.storyService.createStory(user.id).then((story: StoryMetaData) => {
        this.alertService.success("Story Created!")
      }).catch((error) => {
        this.alertService.error(error)
      })
    }).catch(e => {
      this.alertService.error(e)
    })
  }

}
