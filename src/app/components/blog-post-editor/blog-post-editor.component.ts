import { Component, AfterViewInit, OnDestroy } from '@angular/core'
import { ActivatedRoute, Params } from '@angular/router'
import { BlogPostEditorService, AlertService } from '../../_services'
import { BlogPostMetaData, ChapterMetaData } from '../../_models'

@Component({
  selector: 'app-blog-post-editor',
  templateUrl: './blog-post-editor.component.html',
  styleUrls: ['./blog-post-editor.component.css']
})
export class BlogPostEditorComponent implements AfterViewInit, OnDestroy {
  public chapter: ChapterMetaData
  private blogPostId: string
  private blogPost: BlogPostMetaData

  constructor(
    private alertService: AlertService,
    private blogEditorService: BlogPostEditorService,
    private activatedRoute: ActivatedRoute) {

    // Default values to avoid NULL reads
    this.blogPost = <BlogPostMetaData>{
      title: "..."
    }
    this.chapter = <ChapterMetaData>{
      title: "..."
    }
  }

  ngAfterViewInit() {
    this.activatedRoute.params.subscribe((params: Params) => {
      this.blogPostId = params['blog_id'];
      this.blogEditorService.createEditor(this.blogPostId,
        '#quillEditor',
        '#quill-toolbar',
        '#scrolling-container').then((blogPost: BlogPostMetaData) => {
          this.blogPost = blogPost
          if (blogPost && this.blogPost.chapters.length > 0) {
            this.blogEditorService.editChapter(this.blogPost.chapters[0].chapterId).subscribe((chapterMetaData: ChapterMetaData) => {
              if (chapterMetaData) {
                this.chapter = chapterMetaData
              } else {
                this.chapter = <ChapterMetaData>{
                  title: "..."
                }
              }
            })
          } else {
            this.alertService.error("This blogPost has no chapters!")
          }
        })
    })
  }

  ngOnDestroy() {
    this.blogEditorService.destroyEditor()
  }

  onChapterTitleChanged(newTitle: string) {
    this.blogEditorService.updateChapterMetaData({ title: newTitle }).then(() => {
      this.alertService.success("Chapter Renamed!")
    }).catch(e => this.alertService.error(e))
  }
}
