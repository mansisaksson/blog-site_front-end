export interface ChapterMetaData {
    title: string
    URI: string
}

export class StoryChapter {
    metaData: ChapterMetaData
    content: string
}

export interface StoryMetaData {
    storyId: string
    authorId: string
    title: string
    upvotes: number
    downvotes: number
    thumbnailURI: string
    submittedAt: number
    lastUpdated: number
    revision: number
    chapters: ChapterMetaData[]
}