import { Component, OnInit } from '@angular/core'
import { User, StoryMetaData } from './../../../_models'
import { StoryService, AuthenticationService, AlertService } from './../../../_services'
import { Router } from '@angular/router';

@Component({
  selector: 'app-common-tools',
  template: `
  <div *ngIf="enabled">
    <button (click)="editStory()" class="btn btn-primary">Edit Story</button>
  </div>`
})
export class EditStoryComponent implements OnInit {
  private storyId: string
  private enabled: boolean

  constructor(
    private storyService: StoryService,
    private authenticationService: AuthenticationService,
    private alertService: AlertService,
    private router: Router
  ) { }

  ngOnInit() {
    this.enabled = false;
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

  editStory() {
    if (this.enabled) {
      this.authenticationService.withLoggedInUser().then((user: User) => {
        this.router.navigate(['story-editor/' + this.storyId])
      }).catch(e => {
        this.alertService.error(e)
      })
    }
  }

}
