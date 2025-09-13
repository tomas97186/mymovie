export interface MovieModel {
    budget: 16000000,
    genres: {
        id: number,
        name: string
    }[],
    genre_ids: number[],
    id: number,
    imdb_id: string,
    origin_country: string[],
    original_language: string,
    original_title: string,
    overview: string,
    popularity: number,
    poster_path: string,
    backdrop_path: string,
    release_date: Date,
    runtime: number,
    revenue: number,
    status: string,
    tagline: string,
    title: string,
    video: boolean,
    vote_average: number,
    vote_count: number,
    watched: boolean,
    watchedDate: Date,
    personal_rating: number
}