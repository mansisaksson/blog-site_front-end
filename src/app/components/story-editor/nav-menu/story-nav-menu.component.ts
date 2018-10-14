import { Component, OnInit, } from '@angular/core';
import { StoryEditorService, AlertService } from './../../../_services'
import { ChapterContent, StoryMetaData, ChapterMetaData } from '../../../_models';

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
  selector: 'app-story-nav-menu',
  templateUrl: './story-nav-menu.component.html',
  styleUrls: ['./story-nav-menu.component.css']
})
export class StoryNavMenuComponent implements OnInit {
  private navTitles: { [key: string]: NavTitle } = {
    "h1": { fontSize: 12, padding: 10 },
    "h2": { fontSize: 10, padding: 15 },
    "h3": { fontSize: 8, padding: 20 },
  }

  public story: StoryMetaData = <StoryMetaData>{ title: "..." }
  public titleElements: DrawableElem[] = []

  constructor(
    private storyEditor: StoryEditorService,
    private alertService: AlertService
    ) {

  }

  ngOnInit() {
    this.storyEditor.getCurrentStory().subscribe((story) => {
      this.titleElements = []
      if (story) {
        this.story = story
        this.story.chapters.forEach((chapter: ChapterMetaData) => {
          let elem = <DrawableElem>{
            tagName: 'h2',
            content: chapter.title,
            payload: chapter.chapterId
          }
          this.titleElements.push(elem)
        })
      } else {
        story = <StoryMetaData>{ title: "..." }
      }
    })
  }

  editChapter(chapterId: string) {
    this.storyEditor.editChapter(chapterId)
  }

  reorderChapter(chapterId: string, moveUp: boolean) {
    let index = this.titleElements.findIndex(te => te.payload == chapterId)
    if (index != -1) {
      let newIndex = moveUp ? index -1 : index + 1
      if (newIndex < this.titleElements.length) {
        this.storyEditor.swapChapterOrder(chapterId, this.titleElements[newIndex].payload).then(() => {
          this.alertService.success("Chapters rearranged!")
        }).catch(e => { this.alertService.error(e) })
      }
    }
  }

  parseChapter(chapter: ChapterContent) {
    // let parser = new DOMParser()
    // let htmlDoc = parser.parseFromString(chapter.content, "text/html")
    // let elements = htmlDoc.querySelectorAll('h1, h2, h3')
    // this.titleElements = []
    // for (let index = 0; index < elements.length; index++) {
    //   const element = elements[index]
    //   if (this.navTitles[element.tagName.toLowerCase()]) {
    //     this.titleElements.push(element)
    //   }
    // }
  }
}
