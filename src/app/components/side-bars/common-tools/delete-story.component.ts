import { Component, OnInit } from '@angular/core'
import { User, StoryMetaData } from './../../../_models'
import { StoryService, AuthenticationService, AlertService, UIService, DynamicForm } from './../../../_services'
import { Router } from '@angular/router';

@Component({
  selector: 'app-common-tools',
  template: `
  <div *ngIf="enabled">
    <button (click)="deleteStory()" class="btn btn-primary">Delete Story</button>
  </div>`
})
export class DeleteStoryComponent implements OnInit {
  private storyId: string
  private enabled: boolean

  constructor(
    private router: Router,
    private uiService: UIService,
    private storyService: StoryService,
    private authenticationService: AuthenticationService,
    private alertService: AlertService
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

  deleteStory() {
    if (this.enabled) {
      this.authenticationService.withLoggedInUser().then((user: User) => {
        let form: DynamicForm = new DynamicForm("Create Story", "Delete Story")
        form.addTextInput("Type DELETE", "delete", "")

        this.uiService.promptForm('', form).then((entries) => {
          if (entries["delete"].value == "DELETE") {
            this.storyService.deleteStory(this.storyId).then(() => {
              this.router.navigate([''])
            }).catch(e => {
              this.alertService.error(e)
            })
          } else {
            this.alertService.error("Invalid verification string")
          }
        })
        
      }).catch(e => {
        this.alertService.error(e)
      })
    }
  }

}
