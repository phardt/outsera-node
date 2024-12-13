import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Movie } from './models/movie.schema';
import { Model } from 'mongoose';
import { WinnerDto, WinnerResponseDto } from './dtos/winner.dto';
import { ListHelper } from './commons/list.helper';

type MovieGroup = {
  name: string;
  interval: number;
  movies: Movie[];
};

@Injectable()
export class MoviesService {
  constructor(@InjectModel(Movie.name) private movieModel: Model<Movie>) {}

  async getDuplicatedMovies(): Promise<WinnerResponseDto> {
    const movies: Movie[] = await this.movieModel
      .find({ winner: 'yes' })
      .sort({ year: 1 })
      .exec();

    const duplicattedMovies = ListHelper.getAllDuplicateItems(
      movies,
      'producers',
    );

    const max = this.getBigestYearInterval(duplicattedMovies);
    const min = max[0]
      ? this.getSmallYearInterval(duplicattedMovies, max[0].interval)
      : [];
    const winnerDtoRespoonse: WinnerResponseDto = { min, max };
    return winnerDtoRespoonse;
  }

  groupMoviesByProducer(movies: Movie[]): MovieGroup[] {
    const group: MovieGroup[] = [];

    movies.forEach((item) => {
      const producers = movies.filter(
        (mItem) => mItem.producers === item.producers,
      );

      const groupProducer = group.find(
        (gItem) => gItem.name === item.producers,
      );

      if (groupProducer == null) {
        const interval =
          producers[producers.length - 1].year - producers[0].year;
        group.push({ name: item.producers, movies: producers, interval });
      }
    });
    return group;
  }

  getBigestYearInterval(movies: Movie[]): WinnerDto[] {
    let lstMovies = [];
    const group = this.groupMoviesByProducer(movies);

    group.reduce((prev, curr) => {
      if (curr.interval > prev) {
        lstMovies = [curr];
        return curr.interval;
      } else if (curr.interval === prev) {
        lstMovies.push(curr);
        return curr.interval;
      }

      return prev;
    }, 0);

    return this.makeWinnerDto(lstMovies);
  }

  getSmallYearInterval(movies: Movie[], intervalInit: number): WinnerDto[] {
    let lstMovies = [];
    const group = this.groupMoviesByProducer(movies);

    group.reduce((prev, curr) => {
      if (curr.interval < prev) {
        lstMovies = [curr];
        return curr.interval;
      } else if (curr.interval === prev) {
        lstMovies.push(curr);
        return curr.interval;
      }

      return prev;
    }, intervalInit);

    return this.makeWinnerDto(lstMovies);
  }

  makeWinnerDto(lstGroup: MovieGroup[]): WinnerDto[] {
    const lstWinner: WinnerDto[] = lstGroup.map((item) => {
      const followingWin = item.movies[item.movies.length - 1].year;
      const previousWin = item.movies[0].year;
      const winner: WinnerDto = {
        producer: item.name,
        followingWin,
        previousWin,
        interval: item.interval,
      };
      return winner;
    });
    return lstWinner;
  }
}
