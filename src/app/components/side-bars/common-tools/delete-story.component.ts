import { Component } from '@angular/core'
import { User, Story } from './../../../_models'
import { StoryService, AuthenticationService, AlertService } from './../../../_services'

@Component({
  selector: 'app-common-tools',
  template: `
  <div>
    <button (click)="createStory()" class="btn btn-primary">Delete Story</button>
  </div>`
})
export class DeleteStoryComponent {

  constructor(
    private storyService: StoryService,
    private authenticationService: AuthenticationService,
    private alertService: AlertService
  ) { }

  deleteStory() {
    this.authenticationService.withLoggedInUser().then((user: User) => {

    }).catch(e => {
      this.alertService.error(e)
    })
  }

}
