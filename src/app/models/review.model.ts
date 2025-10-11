export interface ReviewModel {
  review: -1 | 1;
  id: string;
  user: string;
  movie: { id: string; poster_path: string };
}
