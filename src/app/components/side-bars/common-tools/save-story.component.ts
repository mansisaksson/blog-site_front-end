import { Component, OnInit } from '@angular/core'
import { User, StoryChapter, StoryMetaData } from './../../../_models'
import { StoryEditorService, StoryService, AuthenticationService, AlertService } from './../../../_services'
import { Router } from '@angular/router';

@Component({
  selector: 'app-common-tools',
  template: `
  <div *ngIf="enabled">
    <button (click)="saveStory()" class="btn btn-primary">Save All</button>
  </div>`
})
export class SaveStoryComponent implements OnInit {
  private story: StoryMetaData
  private enabled: boolean

  constructor(
    private storyEditorService: StoryEditorService,
    private authenticationService: AuthenticationService,
    private alertService: AlertService
  ) { }

  ngOnInit() {
    this.storyEditorService.getStory().subscribe((story: StoryMetaData) => {
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
          this.storyEditorService.saveChapter().then(() => {
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
