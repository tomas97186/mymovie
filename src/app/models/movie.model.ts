import { CreditModel } from './credit.model';
import { ImageModel } from './image.model';
import { ProviderModel, ProviderModelList } from './provider.model';
import { SearchResultsModel } from './search-results.model';
import { VideoModel } from './video.model';

export interface MovieModel {
  budget: 16000000;
  genres: {
    id: number;
    name: string;
  }[];
  genre_ids: number[];
  id: string;
  imdb_id: string;
  origin_country: string[];
  original_language: string;
  original_title: string;
  overview: string;
  popularity: number;
  poster_path: string;
  backdrop_path: string;
  release_date: Date;
  runtime: number;
  revenue: number;
  status: string;
  tagline: string;
  title: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
  watched: boolean;
  watchedDate: Date;
  addedDate?: Date;
  page?: number;
  personal_rating: number;
  recommendations?: SearchResultsModel;
  videos?: { results: VideoModel[] };
  credits?: CreditModel;
  providers: {
    [key: string]: ProviderModelList;
  };
  images?: {
    id: string;
    posters: ImageModel[];
    logos: ImageModel[];
    backdrops: ImageModel[];
  };
}
