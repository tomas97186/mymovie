export interface SearchItemModel {
    backdrop_path: string
    genre_ids: number[]
    id: number,
    name: string,
    title: string,
    original_name: string,
    overview: string,
    popularity: number,
    poster_path: string,
    vote_average: number
    vote_count: number,
    type: 'tv' | 'movie',
    watched?: boolean
}