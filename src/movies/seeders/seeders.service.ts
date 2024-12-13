import { Injectable } from '@nestjs/common';
import { parse } from 'fast-csv';
import { createReadStream } from 'fs';
import { join } from 'path';
import { MovieDto } from 'src/movies/dtos/movie.dto';
import { Model } from 'mongoose';
import { Movie } from '../models/movie.schema';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class SeedersService {
  constructor(@InjectModel(Movie.name) private movieModel: Model<Movie>) {}

  async saveMovies(movies: MovieDto[]): Promise<void> {
    movies.forEach(async (movie) => {
      const year = Number.parseInt(movie.year);
      if (!Number.isNaN(year)) {
        await new this.movieModel({ ...movie }).save();
      }
    });
  }

  async readMovies(): Promise<boolean> {
    return new Promise(async (resolve) => {
      const filePath = join(process.cwd(), './static/Movielist.csv');
      const movies: MovieDto[] = [];
      await createReadStream(filePath)
        .pipe(
          parse({
            headers: false,
            ignoreEmpty: true,
            delimiter: '\;',
          })
            .transform(
              (data): MovieDto => ({
                year: data[0],
                title: data[1],
                studios: data[2],
                producers: data[3],
                winner: data[4],
              }),
            )
            .on('data', (row: MovieDto) => movies.push(row))
            .on('end', async () => {
              await this.saveMovies(movies);
              resolve(true);
            }),
        )
        .on('end', () => process.exit);
    });
  }
}
