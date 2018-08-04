export interface ChapterMetaData {
    chapterId: string
    storyId: string
    URI: string
    title: string
}

export class ChapterContent {
    URI: string
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