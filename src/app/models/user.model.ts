export interface UserModel {
    uid: string,
    username: string,
    listCount: number,
    friends?: string[]
}