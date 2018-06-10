import { StoryDocument, StoryMetaData } from '../../_models/index'
import { toPromise } from 'rxjs/operator/toPromise'

import * as storyMD from './../dummy_data/stories_md.json';

// We do not save the URI to disc since it could potentially change
export class StoryRepository {

  private storiesMD: { [key: string]: StoryMetaData } = {}
  private storyDocuments: { [key: string]: StoryDocument } = {}

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
    localStorage.setItem('stories_md', JSON.stringify(this.storiesMD))
    localStorage.setItem('story_documents', JSON.stringify(this.storyDocuments))
  }

  loadRepo() {
    this.storiesMD = JSON.parse(localStorage.getItem('stories_md'))
    this.storyDocuments = JSON.parse(localStorage.getItem('story_documents'))
  }

  getStoryDocuments(docURIs: string[]): Promise<StoryDocument[]> {
    return new Promise<StoryDocument[]>((resolve, reject) => {
      let result: StoryDocument[] = [];
      docURIs.forEach(docURI => {
        let foundStoryDoc = this.storyDocuments[docURI]
        if (foundStoryDoc != undefined) {
          //foundStoryDoc["URI"] = docURI; // update the URI in case it has changed
          result.push(<StoryDocument>foundStoryDoc)
        }
      })

      resolve(result)
    })
  }

  createStory(title: string, authorId: string): Promise<StoryMetaData> {
    return new Promise<StoryMetaData>((resolve, reject) => {
      let storyId = (Object.keys(this.storiesMD).length + 1).toString()
      let storyDocURI = storyId + "/1";
      let newStory = <StoryDocument>{
        URI: storyDocURI, //We should not save the URI since it could change without us knowing
        title: title,
        content: "Default Content"
      };

      this.storyDocuments[storyDocURI] = newStory;

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

      this.storiesMD[storyId] = newStoryMetaData;

      this.saveRepo();
      resolve(newStoryMetaData);
    })
  }

  removeStory(storyId: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      let storyMD = this.storiesMD[storyId]
      if (!storyMD) {
        return reject(reject("Could not remove - Could not find story"))
      }

      storyMD.storyURIs.forEach(uri => {
        delete this.storyDocuments[storyId]
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
