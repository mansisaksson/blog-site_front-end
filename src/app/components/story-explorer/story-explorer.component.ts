import { Component, OnInit } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { StoryService, AuthenticationService, AlertService, UserService } from '../../_services/index'
import { StoryMetaData, User } from '../../_models/index'
import { environment } from '../../../environments/environment'

@Component({
  selector: 'app-story-explorer',
  templateUrl: './story-explorer.component.html',
  styleUrls: ['./story-explorer.component.css']
})
export class StoryExplorerComponent implements OnInit {
  storyMetaData: StoryMetaData[] = []
  authors: { [key:string]: User } = {}
  userId: string = ""

  constructor(
    private storyService: StoryService,
    private alertService: AlertService,
    private activatedRoute: ActivatedRoute,
    private authService: AuthenticationService,
    private userService: UserService) {
  }

  hasInit = false
  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      this.userId = params['user_id']
    })

    this.hasInit = true
    this.refreshStoryList()
  }

  refreshStoryList() {
    if (this.hasInit) {
      this.storyService.getStories(this.userId).then((data: StoryMetaData[]) => {
        this.storyMetaData = data

        // Find author information
        this.authors = {}
        let authorIds = this.storyMetaData.map(story => story.authorId)
        authorIds.forEach(id => this.authors[id] = <User>{ username: "..." })
        this.userService.getUsers(authorIds).then(users => {
          users.forEach(user => this.authors[user.id] = user)
        }).catch(e => this.alertService.error(e))
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

  getAccessibilityColor(accessibility: string): string {
    switch (accessibility) {
      case 'public':
        return 'white'

      default: /*'private'*/
        return '#cca310'
    }
  }

  getThumbnailURL(thumbnailURI): string {
    if (thumbnailURI && thumbnailURI.length > 0) {
      return environment.backendAddr + '/files/' + thumbnailURI
    } else {
      return "assets/default_thumbnail.png"
    }
  }

  // getUserObject(userId: string): User {
  //   let user = this.authors.find(user => user.id == userId)
  //   return user ? user : <User>{ username: "Unknown User" }
  // }
}
