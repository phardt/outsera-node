import { Controller, Get } from '@nestjs/common';
import { MoviesService } from './movies.service';
import { WinnerResponseDto } from './dtos/winner.dto';

@Controller('movies')
export class MoviesController {
  constructor(private readonly movieService: MoviesService) {}

  @Get()
  async getMovies(): Promise<WinnerResponseDto> {
    const response = this.movieService.getDuplicatedMovies();
    return response;
  }
}
