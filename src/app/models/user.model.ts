export interface UserModel {
  uid: string;
  username: string;
  bio?: string;
  imageBackground?: string;
  listCount: number;
  likedMovies: number;
  dislikedMovies: number;
  friends?: string[];
}
