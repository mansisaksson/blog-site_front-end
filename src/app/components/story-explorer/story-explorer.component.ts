import { Component, OnInit } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { StoryService, AuthenticationService, AlertService } from '../../_services/index'
import { StoryMetaData, User } from '../../_models/index'

@Component({
  selector: 'app-story-explorer',
  templateUrl: './story-explorer.component.html',
  styleUrls: ['./story-explorer.component.css']
})
export class StoryExplorerComponent implements OnInit {
  storyMetaData: StoryMetaData[]
  userId: string
  currentUser: User

  constructor(
    private storyService: StoryService,
    private alertService: AlertService,
    private activatedRoute: ActivatedRoute,
    private authService: AuthenticationService) {
  }

  hasInit = false
  ngOnInit() {
    this.authService.getCurrentUser().subscribe(next => {
      this.currentUser = next
      this.refreshStoryList()
    })
    this.activatedRoute.params.subscribe(params => {
      this.userId = params['user_id']
      this.refreshStoryList()
    })

    this.hasInit = true
    this.refreshStoryList()
  }

  refreshStoryList() {
    if (this.hasInit) {
      this.storyService.getStories(this.userId).then((data: StoryMetaData[]) => {
        this.storyMetaData = data
      }).catch(e => this.alertService.error(e))
    }
  }

  timeSince(date: number) {
    let seconds = Math.floor(Date.now() / 1000 - date / 1000)
    let interval = Math.floor(seconds / 31536000)

    if (interval > 1) {
      return interval + " years"
    }
    interval = Math.floor(seconds / 2592000)
    if (interval > 1) {
      return interval + " months"
    }
    interval = Math.floor(seconds / 86400)
    if (interval > 1) {
      return interval + " days"
    }
    interval = Math.floor(seconds / 3600)
    if (interval > 1) {
      return interval + " hours"
    }
    interval = Math.floor(seconds / 60)
    if (interval > 1) {
      return interval + " minutes"
    }
    return Math.floor(seconds) + " seconds"
  }

}
