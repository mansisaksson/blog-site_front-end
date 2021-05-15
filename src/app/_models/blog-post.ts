export interface ChapterMetaData {
    chapterId: string
    storyId: string // TODO: Rename to blogPostId
    URI: string
    title: string
}

export class ChapterContent {
    URI: string
    content: string
}

export interface BlogPostMetaData {
    storyId: string // TODO: Rename to blogPostId, or just id
    authorId: string
    title: string
    description: string
    friendlyId: string
    accessibility: string
    tags: string[]
    upvotes: number
    downvotes: number
    thumbnailURI: string
    bannerURI: string
    submittedAt: number
    lastUpdated: number
    revision: number
    chapters: ChapterMetaData[]
}

export namespace BlogPostMetaData {
    export const EmptyBlogPost = <BlogPostMetaData>{
        storyId: "",
        authorId: "",
        title: "",
        description: "",
        friendlyId: "",
        accessibility: "",
        tags: [],
        upvotes: 0,
        downvotes: 0,
        thumbnailURI: "",
        bannerURI: "",
        submittedAt: 0,
        lastUpdated: 0,
        revision: 0,
        chapters: []
    }
}
