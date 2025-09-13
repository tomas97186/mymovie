import { SearchItemModel } from "./search-item.model";

export interface SearchResultsModel {
    results: SearchItemModel[],
    current_page: number,
    total_pages: number,
    total_results: number
}