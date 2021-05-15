import { Component, OnInit } from '@angular/core'
import { ActivatedRoute, Params } from '@angular/router'
import { BlogPostService, UserService, SEOService, UIService } from '../../_services/index'
import { ChapterContent, BlogPostMetaData, ChapterMetaData, User } from '../../_models/index'

import * as Quill from 'quill'

@Component({
  selector: 'app-blog-post-viewer',
  templateUrl: './blog-post-viewer.component.html',
  styleUrls: ['./blog-post-viewer.component.css']
})
export class BlogPostViewerComponent implements OnInit {
  private tempBlog = <BlogPostMetaData>{
    authorId: "",
    title: "...",
    chapters: [],
    tags: []
  }
  public blogPost: BlogPostMetaData = this.tempBlog
  private blogPostId: string

  constructor(
    private BlogPostService: BlogPostService,
    private activatedRoute: ActivatedRoute,
    private userService: UserService,
    private uiService: UIService,
    private seoService: SEOService
  ) { }

  ngOnInit() {
    this.activatedRoute.params.subscribe((params: Params) => {
      this.blogPostId = params['blog_id'];
      this.refreshBlog();
    })
  }

  ngOnDestroy() {
    this.seoService.clearPageMeta();
  }

  async refreshBlog() {
    try {
      this.blogPost = await this.BlogPostService.getBlogPost(this.blogPostId);
      if (!this.blogPost) {
        this.blogPost = this.tempBlog;
      }

      this.BlogPostService.setCurrentlyViewedBlogPost(this.blogPost);
      this.uiService.setBannerURI(this.blogPost.bannerURI);

      // Update post meta tags
      this.seoService.setPageTitle(this.blogPost.title);
      this.seoService.setPageDescription(this.blogPost.description);
      this.seoService.setPageTags(this.blogPost.tags);

      await new Promise(resolve => setTimeout(resolve, 0)); // One frame delay to let the html update

      let chapterURIs = this.blogPost.chapters.map(a => a.URI);
      let contents: ChapterContent[] = await this.BlogPostService.getChapterContents(chapterURIs);
      this.blogPost.chapters.forEach((chapter: ChapterMetaData) => {
        var options = {
          modules: {
            toolbar: '',
            syntax: true
          },
          placeholder: 'Nothing here yet...',
          readOnly: true,
          theme: 'bubble'
        }
        var editor = new Quill('#' + 'quill_content_' + chapter.chapterId, options);
        let content = contents.find(a => { return chapter.URI == a.URI });
        if (content) {
          editor.setContents(JSON.parse(content.content));
        }
      });

      let user: User = await this.userService.getUser(this.blogPost.authorId);
      this.seoService.setPageAuthor(user.displayName);
      if (!this.blogPost.bannerURI) {
        this.uiService.setBannerURI(user.bannerURI);
      }
      this.userService.setCurrentlyViewedUser(user);

    } catch (error) {
      console.error(error);
    }
  }

}
