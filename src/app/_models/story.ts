export class StoryDocument {
    title: string
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
    storyURIs: string[]
}