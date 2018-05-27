import { Component, OnInit } from '@angular/core'
import { User } from './../../../_models'
import { StoryService, AuthenticationService, AlertService } from './../../../_services'

@Component({
  selector: 'app-common-tools',
  templateUrl: './common-tools.component.html',
  styleUrls: ['./common-tools.component.css']
})
export class CommonToolsComponent implements OnInit {
  private isLoggedIn: boolean;
  private user: User;

  constructor(
    private storyService: StoryService,
    private authenticationService: AuthenticationService,
    private alertService: AlertService
  ) { }

  ngOnInit() {
    this.authenticationService.getCurrentUser().subscribe((user: User) => {
      this.user = user;
      this.isLoggedIn = user != undefined;
    })
  }

  createStory() {
    this.authenticationService.withLoggedInUser().then((user: User) => {
      this.storyService.createStory(this.user.id).then((story) => {
        console.log("Story Created")
        this.alertService.success("Story Created!")
      }).catch((error) => {
        console.error("Failed to create Story")
        this.alertService.error("failed to create story!")
      })
    }).catch(e => {
      this.alertService.error(e);
    })
  }

  deleteStory() {
    if (this.isLoggedIn) {
      this.storyService.deleteStory(0).then((story) => {

      }).catch((error) => {

      })
    } else {
      this.alertService.error("Not Logged In!")
    }
  }

}
