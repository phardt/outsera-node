import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Movie } from './models/movie.schema';
import { Model } from 'mongoose';
import { WinnerDto, WinnerResponseDto } from './dtos/winner.dto';

type MovieGroup = {
  name: string;
  interval: number;
  movies: Movie[];
};

type valueType = 'min' | 'max';

@Injectable()
export class MoviesService {
  constructor(@InjectModel(Movie.name) private movieModel: Model<Movie>) {}

  async getDuplicatedMovies(): Promise<WinnerResponseDto> {
    const movies: Movie[] = await this.movieModel
      .find({ winner: 'yes' })
      .sort({ year: 1 })
      .exec();

    const groups = this.groupMoviesByProducer(movies).filter(
      (item) => item.movies.length > 1,
    );

    const max = this.getYearInterval(groups, 'max', 0);
    const min =
      max.length > 0
        ? this.getYearInterval(groups, 'min', max[0].interval)
        : [];
    const winnerDtoRespoonse: WinnerResponseDto = { min, max };
    return winnerDtoRespoonse;
  }

  private groupMoviesByProducer(movies: Movie[]): MovieGroup[] {
    const groups: Record<string, MovieGroup> = {};

    movies.forEach((movie) => {
      const producers = movie.producers
        .split(/,\s*|\sand\s/g)
        .map((name) => name.trim());

      producers.forEach((producer) => {
        if (!groups[producer]) {
          groups[producer] = { name: producer, movies: [], interval: 0 };
        }

        const group = groups[producer];
        group.movies.push(movie);
        group.interval = movie.year - group.movies[0].year;
      });
    });

    return Object.values(groups);
  }

  private compareTypeValue(
    typeValue: valueType,
    initialInterval: number,
    interval: number,
  ) {
    return typeValue === 'max'
      ? initialInterval > interval
      : initialInterval < interval;
  }

  private getYearInterval(
    groups: MovieGroup[],
    typeValue: valueType,
    initialValue,
  ): WinnerDto[] {
    let lstMovies = [];

    groups.reduce((prev, curr) => {
      if (this.compareTypeValue(typeValue, curr.interval, initialValue)) {
        lstMovies = [curr];
        return curr.interval;
      } else if (curr.interval === prev) {
        lstMovies.push(curr);
        return curr.interval;
      }

      return prev;
    }, initialValue);

    return this.makeWinnerDto(lstMovies);
  }

  private makeWinnerDto(lstGroup: MovieGroup[]): WinnerDto[] {
    const lstWinner: WinnerDto[] = lstGroup.map((item) => {
      const followingWin = item.movies[item.movies.length - 1].year;
      const previousWin = item.movies[0].year;
      return {
        producer: item.name,
        followingWin,
        previousWin,
        interval: item.interval,
      };
    });
    return lstWinner;
  }
}
