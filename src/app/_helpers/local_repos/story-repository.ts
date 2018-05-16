import { Story, StoryMetaData } from '../../_models/index'
import { toPromise } from 'rxjs/operator/toPromise'

import * as storyMD from './../dummy_data/stories_md.json';

export class StoryRepository {
  stories: Story[];
  storiesMD: StoryMetaData[];

  constructor() {
    this.stories = JSON.parse(localStorage.getItem('stories')) || [];
    this.storiesMD = JSON.parse(localStorage.getItem('stories_md')) || [];

    let metaDataArray = <any>storyMD
    metaDataArray.forEach(element => {
      let storyMetaData: StoryMetaData = element
      storyMetaData.authorId = Math.floor(Math.random() * 6) + 1
      this.storiesMD.push(storyMetaData)

      let story = <Story>{
        storyId: storyMetaData.storyId,
        authorId: storyMetaData.authorId,
        title: storyMetaData.title,
        revision: 0,
        content: "Temp Content"
      }
      this.stories.push(story)
    });
  }

  getAllStories(): Promise<Story[]> {
    return new Promise<Story[]>((resolve, reject) => {
      resolve(this.stories)
    })
  }

  getStory(storyId: number): Promise<Story> {
    return new Promise<Story>((resolve, reject) => {
      let filteredStories = this.stories.filter(story => {
        return (story.storyId === storyId);
      });

      if (filteredStories.length > 0) {
        return resolve(filteredStories[0]);
      }

      reject("Could not find story")
    })
  }

  createStory(title: string, authorId: number): Promise<Story> {
    return new Promise<Story>((resolve, reject) => {
      let storyId = this.stories.length + 1;
      let newStory = <Story>{
        storyId: storyId,
        authorId: authorId,
        title: title,
        revision: 0,
        content: ""
      };

      this.stories.push(newStory);
      localStorage.setItem('stories', JSON.stringify(this.stories));

      let newStoryMetaData = <StoryMetaData>{
        storyId: storyId,
        authorId: authorId,
        authorName: "UNRESOLVABLE",
        title: title,
        upvotes: 0,
        downvotes: 0,
        thumbnail: "",
        submittedAt: Date.now(),
        lastUpdated: Date.now()
      };

      this.storiesMD.push(newStoryMetaData);
      localStorage.setItem('stories_md', JSON.stringify(this.storiesMD));

      resolve(newStory);
    })
  }

  removeStory(storyId: number): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      for (let i = 0; i < this.stories.length; i++) {
        let story = this.stories[i];
        if (story.storyId === storyId) {
          this.stories.splice(i, 1);
          localStorage.setItem('stories', JSON.stringify(this.stories));
          return resolve(true)
        }
      }
      reject("Could not find story")
    })
  }

  getAllStoryMetaData(userId?: number, searchQuery?: string): Promise<StoryMetaData[]> {   
    let metaData = this.storiesMD;
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

  getStoryMetaData(storyId: number): Promise<StoryMetaData> {
    return new Promise<StoryMetaData>((resolve, reject) => {
      let filteredStoryMD = this.storiesMD.filter(storyMD => {
        return storyMD.storyId === storyId;
      });

      if (filteredStoryMD.length > 0) {
        return resolve(filteredStoryMD[0]);
      }

      reject("Could not find story meta data")
    })
  }

}
