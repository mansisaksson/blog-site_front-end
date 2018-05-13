export class Story {
    storyId: number;
    authorId: number;
    title:string;
    revision: number;
    content: string;
}

export interface StoryMetaData {
    storyId:number,
    authorId:number,
    authorName:string,
    title:string,
    upvotes:number,
    downvotes:number,
    thumbnail:string,
    submittedAt:number
    lastUpdated:number
}