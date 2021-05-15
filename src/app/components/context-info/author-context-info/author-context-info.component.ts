import { Component, OnInit } from '@angular/core'
import { UserService } from '../../../_services'
import { BlogPostMetaData, User } from '../../../_models'
import { faArrowUp, faArrowDown } from '@fortawesome/free-solid-svg-icons'
import { environment } from './../../../../environments/environment'

@Component({
  selector: 'app-author-context-info',
  templateUrl: './author-context-info.component.html',
  styleUrls: ['./author-context-info.component.css']
})
export class AuthorContextInfoComponent implements OnInit {
  faArrowUp = faArrowUp
  faArrowDown = faArrowDown

  public blogPost: BlogPostMetaData = <BlogPostMetaData>{ title: "..." }
  public author: User = <User>{ username: "..." }

  constructor(
    private userService: UserService
  ) {
  }

  ngOnInit() {
    this.userService.getCurrentlyViewedUser().subscribe(user => {
      if (user) {
        this.author = user
      }
      else {
        this.author = <User>{ username: "error" }
      }
    })
  }

  getAuthorProfilePicture() {
    if (this.author.profilePictureURI) {
      return environment.backendAddr + '/api/file/content/' + this.author.profilePictureURI
    } else {
      return 'assets/default_thumbnail.png'
    }
  }

  getAuthorDisplayName() {
    if (this.author.displayName) {
      return this.author.displayName
    } else {
      return this.author.username
    }
  }
}
