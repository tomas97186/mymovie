export interface UserModel {
    uid: string,
    username: string,
    listCount: number,
    likedMovies: number,
    dislikedMovies: number,
    friends?: string[]
}