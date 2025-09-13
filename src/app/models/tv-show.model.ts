export interface TvShowModel {
    adult: boolean
    backdrop_path: string
    episode_run_time: number[]
    first_air_date: string
    genres: { id: string, name: string },
    homepage: string
    id: number
    in_production: boolean
    languages: string[],
    last_air_date: string
    name: string,
    next_episode_to_air: string,
    number_of_episodes: number
    number_of_seasons: number
    origin_country: string[]
    original_language: string
    original_name: string
    overview: string
    popularity: number
    poster_path: string
    seasons: TvShowModel[]
    status: string
    tagline: string
    type: string
    vote_average: number
    vote_count: number
}