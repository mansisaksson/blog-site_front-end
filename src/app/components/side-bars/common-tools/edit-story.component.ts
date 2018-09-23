import { Component, OnInit } from '@angular/core'
import { User, StoryMetaData } from './../../../_models'
import { StoryService, StoryEditorService, AuthenticationService, AlertService } from './../../../_services'
import { Router } from '@angular/router';

@Component({
  selector: 'app-common-tools',
  template: `
  <div *ngIf="enabled" style="padding-top: 5px;">
    <button (click)="editStory()" class="btn btn-primary" style="width: 100%">Edit Story</button>
  </div>`
})
export class EditStoryComponent implements OnInit {
  public enabled: boolean
  private storyId: string

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
