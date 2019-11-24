import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core'
import { ActivatedRoute, Params } from '@angular/router'
import { BlogPostService, AlertService } from '../../_services/index'
import { ChapterContent, BlogPostMetaData, ChapterMetaData } from '../../_models/index'

import * as Quill from 'quill'

@Component({
  selector: 'app-blog-post-viewer',
  templateUrl: './blog-post-viewer.component.html',
  styleUrls: ['./blog-post-viewer.component.css']
})
export class BlogPostViewerComponent implements OnInit {
  private tempBlog = <BlogPostMetaData>{
    title: "...",
    chapters: []
  }
  public blogPost: BlogPostMetaData = this.tempBlog
  private blogPostId: string

  constructor(
    private BlogPostService: BlogPostService,
    private alertService: AlertService,
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit() {
    this.activatedRoute.params.subscribe((params: Params) => {
      this.blogPostId = params['blog_id']
      this.refreshBlog()
    })
  }

  refreshBlog() {
    this.BlogPostService.getBlogPost(this.blogPostId).then((blogPost) => {
      this.blogPost = blogPost
      this.BlogPostService.setCurrentlyViewedBlogPost(blogPost)

      if (!this.blogPost) {
        this.blogPost = this.tempBlog
      }

      setTimeout(() => { // One frame delay to let the html update
        let chapterURIs = blogPost.chapters.map(a => a.URI)
        this.BlogPostService.getChapterContents(chapterURIs).then((contents: ChapterContent[]) => {
          var options = {
            modules: {
              toolbar: ''
            },
            placeholder: 'Nothing here yet...',
            readOnly: true,
            theme: 'bubble'
          }
          blogPost.chapters.forEach((chapter: ChapterMetaData) => {
            try {
              var editor = new Quill('#' + 'quill_content_' + chapter.chapterId, options)
              let content = contents.find(a => { return chapter.URI == a.URI })
              editor.setContents(JSON.parse(content.content))
            } catch { }
          })
  
        }).catch((e) => console.log(e))
      }, 0)
    }).catch((e) => console.log(e))
  }

}
