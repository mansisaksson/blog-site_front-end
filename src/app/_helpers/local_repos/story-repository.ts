import { StoryChapter, StoryMetaData, ChapterMetaData } from '../../_models/index'

// We do not save the URI to disc since it could potentially change
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

  getStoryChapters(chapterURIs: string[]): Promise<StoryChapter[]> {
    return new Promise<StoryChapter[]>((resolve, reject) => {
      let result: StoryChapter[] = []
      chapterURIs.forEach(uri => {
        let foundChapter = this.chapterContents[uri]
        if (foundChapter != undefined) {
          let chapter = <StoryChapter>{
            metaData: this.chapterMetaData[uri],
            content: foundChapter
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

  createChapter(storyId: string, chapterTitle: string): Promise<ChapterMetaData> {
    return new Promise<ChapterMetaData>((resolve, reject) => {
      this.getStory(storyId).then((story: StoryMetaData) => {

        let chapterURI = StoryRepository.createGuid()

        let chapterMetaData = <ChapterMetaData>{
          URI: chapterURI, //We should not save the URI since it could change without us knowing
          title: chapterTitle,
        }

        this.chapterMetaData[chapterURI] = chapterMetaData
        this.chapterContents[chapterURI] = "";

        story.chapters.push(chapterMetaData)
        this.saveRepo()

        resolve(chapterMetaData)
      }).catch(e => reject(e))
    })
  }

  updateStoryChapter(uri: string, chapter: StoryChapter): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      if (this.chapterMetaData[uri] != undefined) {
        this.chapterMetaData[uri] = chapter.metaData
        this.chapterContents[uri] = chapter.content
        this.saveRepo()
        resolve(true)
      } else {
        reject("Could not find story chapter")
      }
    })
  }

  removeStory(storyId: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      let storyMD = this.storiesMD[storyId]
      if (!storyMD) {
        return reject(reject("Could not remove - Could not find story"))
      }

      storyMD.chapters.forEach(chapter => {
        delete this.chapterMetaData[chapter.URI]
        delete this.chapterContents[chapter.URI]
      });
      delete this.storiesMD[storyId]

      this.saveRepo();
      resolve(true)
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
        storyMD.chapters[chapter.URI] = this.chapterMetaData[chapter.URI]
      })
    })

    return new Promise<StoryMetaData[]>((resolve, reject) => {
      resolve(metaData)
    })
  }

  getStory(storyId: string): Promise<StoryMetaData> {
    return new Promise<StoryMetaData>((resolve, reject) => {
      let storyMD = this.storiesMD[storyId]
      if (storyMD != undefined) {
        // Append chapter meta data
        storyMD.chapters.forEach(chapter => {
          storyMD.chapters[chapter.URI] = this.chapterMetaData[chapter.URI]
        })
        resolve(storyMD);
      }
      else {
        reject("getStory - Could not find story")
      }
    })
  }

}
