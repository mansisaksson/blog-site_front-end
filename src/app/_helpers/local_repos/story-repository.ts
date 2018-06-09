import { StoryDocument, StoryMetaData } from '../../_models/index'
import { toPromise } from 'rxjs/operator/toPromise'

import * as storyMD from './../dummy_data/stories_md.json';

export class StoryRepository {
  storyDocuments: Map<string, StoryDocument> = new Map<string, StoryDocument>()
  storiesMD: Map<string, StoryMetaData> = new Map<string, StoryMetaData>()

  constructor() {
    this.loadRepo()

    // let metaDataArray = <any>storyMD
    // metaDataArray.forEach((element) => {
    //   let storyMetaData: StoryMetaData = element;
    //   storyMetaData.authorId = (Math.floor(Math.random() * 1000) + 500).toString()
    //   this.storiesMD.set(storyMetaData.storyId, storyMetaData)

    //   let story = <StoryDocument>{
    //     title: storyMetaData.title,
    //     content: "Temp Content"
    //   }
    //   this.stories.set(storyMetaData.storyId, story)
    // })
  }

  saveRepo() {
    localStorage.setItem('stories_md', StoryRepository.mapToJson(this.storiesMD))
    localStorage.setItem('story_documents', StoryRepository.mapToJson(this.storyDocuments))
  }

  loadRepo() {
    let localStories = StoryRepository.mapFromJson<string, StoryDocument>(localStorage.getItem('stories'))
    if (localStories != undefined && localStories.size > 0) {
      this.storyDocuments = localStories
    }

    let localStoryMD = StoryRepository.mapFromJson<string, StoryMetaData>(localStorage.getItem('stories_md'))
    if (localStoryMD != undefined && localStoryMD.size > 0) {
      this.storiesMD = localStoryMD
    }
  }

  static mapToJson(map: Map<any, any>): string {
    let objectArray: any[] = []
    map.forEach((value: any, key: any) => {
      objectArray.push({ key: key, value: value })
    })

    return JSON.stringify(objectArray)
  }

  static mapFromJson<key, value>(json: string): Map<key, value> {
    let returnMap = new Map<key, value>()
    let parsedArray: any[] = JSON.parse(json)
    if (parsedArray != undefined) {
      parsedArray.forEach(element => {
        returnMap.set(element.key, element.value)
      })
    }
    return returnMap
  }

  getStoryDocuments(docURIs: string[]): Promise<StoryDocument[]> {
    return new Promise<StoryDocument[]>((resolve, reject) => {
      let result: StoryDocument[] = [];
      docURIs.forEach(docURI => {
        let foundStory = this.storyDocuments[docURI]
        if (foundStory != undefined) {
          result.push(foundStory)
        }
      });

      resolve(result)
    })
  }

  createStory(title: string, authorId: string): Promise<StoryMetaData> {
    return new Promise<StoryMetaData>((resolve, reject) => {
      let storyId = (this.storiesMD.size + 1).toString()
      let storyDocURI = storyId + "/1";
      let newStory = <StoryDocument>{
        title: title,
        content: "Default Content"
      };

      this.storyDocuments.set(storyDocURI, newStory);

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
      };

      this.storiesMD.set(storyId, newStoryMetaData);

      this.saveRepo();
      resolve(newStoryMetaData);
    })
  }

  removeStory(storyId: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {

      if (this.storyDocuments.delete(storyId) && this.storiesMD.delete(storyId)) {
        this.saveRepo();
        return resolve(true)
      }

      reject("Could not remove - Could not find story")
    })
  }

  getAllStories(userId?: string, searchQuery?: string): Promise<StoryMetaData[]> {
    let metaData: StoryMetaData[] = []
    this.storiesMD.forEach((value: StoryMetaData, key: string) => {
      metaData.push(value)
    });

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
      let storyMD = this.storiesMD.get(storyId)
      if (storyMD != undefined) {
        return resolve(storyMD);
      }

      reject("getStory- Could not find story")
    })
  }

}
