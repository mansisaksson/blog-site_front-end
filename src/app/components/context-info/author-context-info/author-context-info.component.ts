import { Component, OnInit, AfterContentInit } from '@angular/core'
import { BlogPostService, UserService, UIService, AuthenticationService } from '../../../_services'
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

  contextInfoParams : string[] = []

  constructor(
    private blogPostService: BlogPostService,
    private uiService: UIService,
    private userService: UserService,
    private authService: AuthenticationService
  ) {

  }

  ngOnInit() {
    if (this.contextInfoParams && this.contextInfoParams.includes('blog-post-context')) {
      this.blogPostService.getCurrentlyViewedBlogPost().subscribe(blogPost => {
        if (!blogPost) {
          return;
        }

        this.blogPost = blogPost
        this.uiService.setBannerURI(blogPost.bannerURI)

        this.userService.getUsers([this.blogPost.authorId]).then(users => {
          if (users !== undefined && users.length > 0) {
            this.author = users[0]
          }
          else {
            this.author = <User>{ username: "error" }
          }
        })
      })
    }
    else if (this.contextInfoParams && this.contextInfoParams.includes('user-editor-context')) {
      this.authService.getCurrentUser().subscribe(user => {
        if (!user) {
          return;
        }
        this.author = user
        this.uiService.setBannerURI(this.author.bannerURI)
      })
    }
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
