export class Story {
    storyId: number;
    authorId: number;
    revision: number;
    title: string;
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