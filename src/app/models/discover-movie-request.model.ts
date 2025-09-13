export interface DiscoverMovieRequestModel {
    certification?: string
    'certification.gte'?: string
    'certification.lte'?: string
    certification_country?: string
    include_adult?: boolean
    include_video?: boolean
    language?: string
    page?: number
    primary_release_year?: number
    'primary_release_date.gte'?: string
    'primary_release_date.lte'?: string
    region?: string
    'release_date.gte'?: string
    'release_date.lte'?: string
    'vote_average.desc'?: number
    'vote_average.gte'?: number
    'vote_average.lte'?: number
    'vote_count.gte'?: number
    'vote_count.lte'?: number
    watch_region?: string
    with_cast?: string
    with_companies?: string
    with_crew?: string
    with_genres?: string
    with_keywords?: string
    with_origin_country?: string
    with_original_language?: string
    with_people?: string
    with_release_type?: 1 | 2 | 3 | 4 | 5 | 6
    "with_runtime.gte"?: number
    "with_runtime.lte"?: number
    with_watch_monetization_types?: "flatrate" | "free" | "ads" | "rent" | "buy"
    with_watch_providers?: string
    without_companies?: string
    without_genres?: string
    without_keywords?: string
    without_watch_providers?: string
    year?: number
    sort_by?: 'popularity.asc' | 'popularity.desc' | 'release_date.asc' | 'release_date.desc' | 'original_title.asc' | 'original_title.desc' | 'vote_average.asc' | 'vote_average.desc'
}