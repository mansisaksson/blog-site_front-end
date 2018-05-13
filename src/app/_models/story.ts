export class Story {
    storyId: number;
    title: string;
    author: string;
    content: string;
}

export interface StoryMetaData {
    title:string,
    authorName:string,
    storyId:number,
    upvotes:number,
    downvotes:number,
    thumbnail:string,
    submittedAt:number
    lastUpdated:number
}