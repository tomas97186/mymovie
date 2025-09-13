import { MovieModel } from "./movie.model";
import { UserModel } from "./user.model";

export interface InfoListModel {
    name: string,
    createdBy: string,
    id: string,
    watchedMovies: number,
    moviesCount: number,
    membersCount: number

}

export interface MovieListModel {
    movies: MovieModel[],
    members: UserModel[],
    info: InfoListModel
}