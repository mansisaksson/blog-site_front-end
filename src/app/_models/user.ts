export class User {
    id: string
    username: string
    displayName: string
    profilePictureURI: string
    bannerURI: string
    description: string
    createdAt: number
    password?: string
}

export namespace User {
    export const EmptyUser = <User>{
        id: "", 
        username: "", 
        displayName: "", 
        profilePictureURI: "", 
        bannerURI: "", 
        description: "", 
        createdAt: 0 
    }
}