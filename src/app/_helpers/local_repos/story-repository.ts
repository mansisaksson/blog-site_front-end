import { StoryChapter, StoryMetaData, ChapterMetaData } from '../../_models/index'

// We do not save the URI to disc since it could potentially change
export class StoryRepository {

  private storiesMD: { [key: string]: StoryMetaData } = {}
  private storyChapters: { [key: string]: StoryChapter } = {}

  constructor() {
    this.loadRepo()

    // let metaDataArray = <any>storyMD
    // metaDataArray.forEach((element) => {
    //   let storyMetaData: StoryMetaData = element;
    //   storyMetaData.authorId = (Math.floor(Math.random() * 1000) + 500).toString()
    //   this.storiesMD.set(storyMetaData.storyId, storyMetaData)

    //   let story = <StoryChapter>{
    //     title: storyMetaData.title,
    //     content: "Temp Content"
    //   }
    //   this.stories.set(storyMetaData.storyId, story)
    // })
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
    localStorage.setItem('story_chapters', JSON.stringify(this.storyChapters))
  }

  loadRepo() {
    let storiesMD = JSON.parse(localStorage.getItem('stories_md'))
    if (storiesMD) {
      this.storiesMD = storiesMD;
    }
    let storyChapters = JSON.parse(localStorage.getItem('story_chapters'))
    if (storyChapters) {
      this.storyChapters = storyChapters;
    }
  }

  getStoryChapters(docURIs: string[]): Promise<StoryChapter[]> {
    return new Promise<StoryChapter[]>((resolve, reject) => {
      let result: StoryChapter[] = []
      docURIs.forEach(docURI => {
        let foundStoryDoc = this.storyChapters[docURI]
        if (foundStoryDoc != undefined) {
          //foundStoryDoc["URI"] = docURI; // update the URI in case it has changed
          result.push(<StoryChapter>foundStoryDoc)
        }
      })

      resolve(result)
    })
  }

  createStory(title: string, authorId: string, chapter1Title: string): Promise<StoryMetaData> {
    return new Promise<StoryMetaData>((resolve, reject) => {
      let storyId = StoryRepository.createGuid()
      let storyDocURI = StoryRepository.createGuid()

      let chapterMetaData = <ChapterMetaData>{
        URI: storyDocURI, //We should not save the URI since it could change without us knowing
        title: chapter1Title,
      }

      let newStory = <StoryChapter>{
        metaData: chapterMetaData,
        content: ""
      }

      this.storyChapters[storyDocURI] = newStory;

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
        storyURIs: [storyDocURI]
      }

      this.storiesMD[storyId] = newStoryMetaData

      this.saveRepo()
      resolve(newStoryMetaData)
    })
  }

  updateStoryChapter(uri: string, chapter: StoryChapter): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      if (this.storyChapters[uri]) {
        this.storyChapters[uri] = chapter
        this.saveRepo()
        resolve(true)
      } else {
        reject()
      }
    })
  }

  removeStory(storyId: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      let storyMD = this.storiesMD[storyId]
      if (!storyMD) {
        return reject(reject("Could not remove - Could not find story"))
      }

      storyMD.storyURIs.forEach(uri => {
        delete this.storyChapters[storyId]
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

    return new Promise<StoryMetaData[]>((resolve, reject) => {
      resolve(metaData)
    })
  }

  getStory(storyId: string): Promise<StoryMetaData> {
    return new Promise<StoryMetaData>((resolve, reject) => {
      let storyMD = this.storiesMD[storyId]
      if (storyMD != undefined) {
        resolve(storyMD);
      }
      else {
        reject("getStory - Could not find story")
      }
    })
  }

}
