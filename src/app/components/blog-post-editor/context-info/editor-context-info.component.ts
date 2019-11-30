import { Component, OnInit, } from '@angular/core';
import { BlogPostEditorService, AlertService, UIService } from '../../../_services'
import { BlogPostMetaData, ChapterMetaData } from '../../../_models';
import { faArrowUp, faArrowDown } from '@fortawesome/free-solid-svg-icons';

interface NavTitle {
  fontSize: number,
  padding: number
}

class DrawableElem {
  public tagName: string
  public content: string
  public payload: any
}

@Component({
  selector: 'app-editor-context-info',
  templateUrl: './editor-context-info.component.html',
  styleUrls: ['./editor-context-info.component.css']
})
export class EditorContextInfoComponent implements OnInit {
  faArrowUp = faArrowUp
  faArrowDown = faArrowDown
  public bannerURI = "" // Hacky way of linking banner to ContextInfoComponent

  private navTitles: { [key: string]: NavTitle } = {
    "h1": { fontSize: 12, padding: 0 },
    "h2": { fontSize: 10, padding: 0 },
    "h3": { fontSize: 8, padding: 0 },
  }

  public blogPost: BlogPostMetaData = <BlogPostMetaData>{ title: "..." }
  public titleElements: DrawableElem[] = []

  constructor(
    private blogEditor: BlogPostEditorService,
    private uiService: UIService,
    private alertService: AlertService
    ) {

  }

  ngOnInit() {
    this.blogEditor.getCurrentBlog().subscribe((blogPost) => {
      this.titleElements = []
      if (blogPost) {
        this.blogPost = blogPost
        this.uiService.setBannerURI(blogPost.bannerURI)
        this.blogPost.chapters.forEach((chapter: ChapterMetaData) => {
          let elem = <DrawableElem>{
            tagName: 'h2',
            content: chapter.title,
            payload: chapter.chapterId
          }
          this.titleElements.push(elem)
        })
      } else {
        blogPost = <BlogPostMetaData>{ title: "..." }
      }
    })
  }

  editChapter(chapterId: string) {
    this.blogEditor.editChapter(chapterId)
  }

  reorderChapter(chapterId: string, moveUp: boolean) {
    let index = this.titleElements.findIndex(te => te.payload == chapterId)
    if (index != -1) {
      let newIndex = moveUp ? index -1 : index + 1
      if (newIndex < this.titleElements.length) {
        this.blogEditor.swapChapterOrder(chapterId, this.titleElements[newIndex].payload).then(() => {
          this.alertService.success("Chapters rearranged!")
        }).catch(e => { this.alertService.error(e) })
      }
    }
  }

}
