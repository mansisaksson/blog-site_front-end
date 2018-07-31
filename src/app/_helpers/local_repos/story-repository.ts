import { StoryChapter, StoryMetaData, ChapterMetaData } from '../../_models/index'

export class StoryRepository {

  private storiesMD: { [key: string]: StoryMetaData } = {}
  private chapterMetaData: { [key: string]: ChapterMetaData } = {}
  private chapterContents: { [key: string]: string } = {}

  constructor() {
    this.loadRepo()
  }

  static createGuid(): string {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
  }

  saveRepo() {
    localStorage.setItem('stories_md', JSON.stringify(this.storiesMD))
    localStorage.setItem('story_chapters', JSON.stringify(this.chapterContents))
    localStorage.setItem('chapter_md', JSON.stringify(this.chapterMetaData))
  }

  loadRepo() {
    let storiesMD = JSON.parse(localStorage.getItem('stories_md'))
    if (storiesMD) {
      this.storiesMD = storiesMD;
    }
    let storyChapters = JSON.parse(localStorage.getItem('story_chapters'))
    if (storyChapters) {
      this.chapterContents = storyChapters;
    }
    let chapterMD = JSON.parse(localStorage.getItem('chapter_md'))
    if (chapterMD) {
      this.chapterMetaData = chapterMD;
    }
  }

  createChapter(storyId: string, chapterTitle: string): Promise<StoryMetaData> {
    return new Promise<StoryMetaData>((resolve, reject) => {
      this.getStory(storyId).then((story: StoryMetaData) => {
        let chapterId = StoryRepository.createGuid()
        let chapterURI = StoryRepository.createGuid()
        let chapterMetaData = <ChapterMetaData>{
          chapterId: chapterId,
          storyId: story.storyId,
          URI: chapterURI, //We should not save the URI since it could change without us knowing
          title: chapterTitle,
        }

        this.chapterMetaData[chapterId] = chapterMetaData
        this.chapterContents[chapterURI] = ""

        story.chapters.push(chapterMetaData)
        this.updateStory(story).then(() => {
          resolve(story)
        }).catch(e => reject(e))
      }).catch(e => reject(e))
    })
  }

  removeChapter(chapterId: string): Promise<StoryMetaData> {
    return new Promise<StoryMetaData>((resolve, reject) => {
      let storyId = this.chapterMetaData[chapterId].storyId
      this.getStory(storyId).then((story: StoryMetaData) => {
        if (!this.chapterMetaData[chapterId]) {
          return reject(reject("Could not remove - Could not find chapter"))
        }

        let uri = this.chapterMetaData[chapterId].URI
        delete this.chapterContents[uri]
        delete this.chapterMetaData[chapterId]

        story.chapters = story.chapters.filter(value => { return value.chapterId != chapterId })
        this.updateStory(story).then(() => {
          resolve(story)
        }).catch(e => reject(e))
      }).catch(e => reject(e))
    })
  }

  updateChapterMetaData(chapterId: string, metaData: ChapterMetaData): Promise<StoryMetaData> {
    return new Promise<StoryMetaData>((resolve, reject) => {
      let storyId = this.chapterMetaData[chapterId].storyId
      this.getStory(storyId).then((story: StoryMetaData) => {
        if (!this.chapterMetaData[chapterId]) {
          return reject(reject("Could not remove - Could not find chapter"))
        }

        metaData.chapterId = chapterId
        this.chapterMetaData[chapterId] = metaData
        let chapterIndex = story.chapters.findIndex((value) => { return value.chapterId == chapterId })
        story.chapters[chapterIndex] = metaData
        this.updateStory(story).then(() => {
          resolve(story)
        }).catch(e => reject(e))
      }).catch(e => reject(e))
    })
  }

  updateChapterContent(storyId: string, content: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      if (this.chapterMetaData[storyId] != undefined) {
        let uri = this.chapterMetaData[storyId].URI
        this.chapterContents[uri] = content
        this.saveRepo()
        resolve(true)
      } else {
        reject("Could not find story chapter")
      }
    })
  }

  getChapters(chapterIds: string[]): Promise<StoryChapter[]> {
    return new Promise<StoryChapter[]>((resolve, reject) => {
      let result: StoryChapter[] = []
      chapterIds.forEach(chapterId => {
        let foundChapter = this.chapterMetaData[chapterId]
        if (foundChapter != undefined) {
          let chapter = <StoryChapter>{
            metaData: foundChapter,
            content: this.chapterContents[foundChapter.URI]
          }
          result.push(chapter)
        }
      })

      resolve(result)
    })
  }

  createStory(title: string, authorId: string, chapter1Title: string): Promise<StoryMetaData> {
    return new Promise<StoryMetaData>((resolve, reject) => {
      let storyId = StoryRepository.createGuid()

      let newStoryMetaData = <StoryMetaData>{
        storyId: storyId,
        authorId: authorId,
        title: title,
        upvotes: 0,
        downvotes: 0,
        thumbnailURI: "",
        submittedAt: Date.now(),
        lastUpdated: Date.now(),
        revision: 0,
        chapters: []
      }

      this.storiesMD[storyId] = newStoryMetaData

      this.createChapter(storyId, chapter1Title).then(() => {
        resolve(newStoryMetaData)
      }).catch(e => reject(e))
    })
  }

  removeStory(storyId: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      let storyMD = this.storiesMD[storyId]
      if (!storyMD) {
        return reject(reject("Could not remove - Could not find story"))
      }

      storyMD.chapters.forEach(chapter => {
        delete this.chapterContents[chapter.URI]
        delete this.chapterMetaData[chapter.chapterId]
      });
      delete this.storiesMD[storyId]

      this.saveRepo();
      resolve(true)
    })
  }

  private updateStory(story: StoryMetaData): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      if (!story) {
        return reject("Invalid story")
      }
      this.storiesMD[story.storyId] = story
      this.saveRepo();
      resolve(true)
    })
  }

  updateStoryTitle(storyId: string, newTitle: string): Promise<StoryMetaData> {
    return new Promise<StoryMetaData>((resolve, reject) => {
      let storyMD: StoryMetaData = this.storiesMD[storyId]
      if (storyMD) {
        storyMD.title = newTitle
        this.updateStory(storyMD).then(success => {
          resolve(storyMD)
        }).catch(e => reject(e))
      } else {
        reject("updateStoryTitle - Invalid story")
      }
    })
  }

  getStory(storyId: string): Promise<StoryMetaData> {
    return new Promise<StoryMetaData>((resolve, reject) => {
      let storyMD = this.storiesMD[storyId]
      if (storyMD != undefined) {
        // Append chapter meta data
        storyMD.chapters.forEach(chapter => {
          storyMD.chapters[chapter.chapterId] = this.chapterMetaData[chapter.chapterId]
        })
        resolve(storyMD);
      }
      else {
        reject("getStory - Could not find story")
      }
    })
  }

  getAllStories(userId?: string, searchQuery?: string): Promise<StoryMetaData[]> {
    let metaData: StoryMetaData[] = []
    Object.values(this.storiesMD).forEach((value: StoryMetaData) => {
      metaData.push(value)
    })

    if (userId) {
      metaData = metaData.filter(obj => obj.authorId === userId)
    }
    if (searchQuery) {
      metaData = metaData.filter(obj => obj.title.indexOf(searchQuery) >= 0)
    }

    metaData.forEach(storyMD => {
      // Append chapter meta data
      storyMD.chapters.forEach(chapter => {
        storyMD.chapters[chapter.chapterId] = this.chapterMetaData[chapter.chapterId]
      })
    })

    return new Promise<StoryMetaData[]>((resolve, reject) => {
      resolve(metaData)
    })
  }

}
