import { Component, OnInit } from '@angular/core'
import { User, StoryMetaData } from './../../../_models'
import { StoryEditorService, AuthenticationService, AlertService } from './../../../_services'

@Component({
  selector: 'app-common-tools',
  template: `
  <div *ngIf="enabled" style="padding-top: 5px;">
    <button (click)="saveStory()" class="btn btn-primary" style="width: 100%">Save Chapter</button>
  </div>`
})
export class SaveStoryComponent implements OnInit {
  public enabled: boolean
  private story: StoryMetaData

  constructor(
    private storyEditorService: StoryEditorService,
    private authenticationService: AuthenticationService,
    private alertService: AlertService
  ) { }

  ngOnInit() {
    this.storyEditorService.getCurrentStory().subscribe((story: StoryMetaData) => {
      this.enabled = false;
      this.story = story;
      if (story != undefined) {
        this.authenticationService.getCurrentUser().subscribe((user: User) => {
          if (user != undefined) {
            this.enabled = (user.id == story.authorId) ? true : false
          }
        })
      } else {
        this.enabled = false
      }
    })
  }

  saveStory() {
    if (this.enabled) {
      this.authenticationService.withLoggedInUser().then((user: User) => {
        if (this.story != undefined) {
          this.storyEditorService.saveCurrentChapter().then(() => {
            this.alertService.success("Chapter saved!")
          }).catch(e => this.alertService.error(e))
        } else {
          this.alertService.error("No Valid story currently being edited")
        }
      }).catch(e => {
        this.alertService.error(e)
      })
    }
  }

}
