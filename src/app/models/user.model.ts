export interface UserModel {
  uid: string;
  username: string;
  bio?: string;
  avatarUrl?: string;
  listCount: number;
  likedMovies: number;
  dislikedMovies: number;
  friends?: string[];
}
