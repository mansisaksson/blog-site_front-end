import { Component, OnInit, } from '@angular/core'
import { BlogPostService, UserService, UIService } from '../../../_services'
import { BlogPostMetaData, User } from '../../../_models'
import { faArrowUp, faArrowDown } from '@fortawesome/free-solid-svg-icons'

@Component({
  selector: 'app-post-context-info',
  templateUrl: './blog-post-context-info.component.html',
  styleUrls: ['./blog-post-context-info.component.css']
})
export class BlogPostContextInfoComponent implements OnInit {
  faArrowUp = faArrowUp
  faArrowDown = faArrowDown

  public blogPost: BlogPostMetaData = <BlogPostMetaData>{ title: "..." }
  public author: User = <User>{ username: "..." }

  constructor(
    private blogPostService: BlogPostService,
    private uiService: UIService,
    private userService: UserService
    ) {
      
  }

  ngOnInit() {
    this.blogPostService.getCurrentlyViewedBlogPost().subscribe(blogPost => {
      if (!blogPost){
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

}
