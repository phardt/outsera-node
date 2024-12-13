import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ListHelper } from '../commons/list.helper';
import { MoviesService } from '../movies.service';
import { Movie } from '../models/movie.schema';
import { WinnerResponseDto } from '../dtos/winner.dto';

describe('MoviesService', () => {
  let service: MoviesService;
  let movieModel: any;

  const mockMovieModel = {
    find: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    exec: jest.fn(),
  };

  const mockListHelper = {
    getAllDuplicateItems: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MoviesService,
        { provide: getModelToken(Movie.name), useValue: mockMovieModel },
        { provide: ListHelper, useValue: mockListHelper },
      ],
    }).compile();

    service = module.get<MoviesService>(MoviesService);
    movieModel = module.get(getModelToken(Movie.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getDuplicatedMovies', () => {
    it('should return WinnerResponseDto with min and max intervals', async () => {
      const mockMovies: Movie[] = [
        { year: 1980, winner: 'yes', producers: 'Producer1' } as Movie,
        { year: 1990, winner: 'yes', producers: 'Producer1' } as Movie,
        { year: 2000, winner: 'yes', producers: 'Producer2' } as Movie,
        { year: 2010, winner: 'yes', producers: 'Producer2' } as Movie,
      ];

      const mockDuplicateMovies = [
        { year: 1980, producers: 'Producer1' },
        { year: 1990, producers: 'Producer1' },
      ];

      movieModel.exec.mockResolvedValue(mockMovies);
      mockListHelper.getAllDuplicateItems.mockReturnValue(mockDuplicateMovies);
      jest.spyOn(service, 'getBigestYearInterval').mockReturnValue([
        {
          producer: 'Producer1',
          previousWin: 1980,
          followingWin: 1990,
          interval: 10,
        },
      ]);

      jest.spyOn(service, 'getSmallYearInterval').mockReturnValue([
        {
          producer: 'Producer1',
          previousWin: 1980,
          followingWin: 1990,
          interval: 10,
        },
      ]);

      const result: WinnerResponseDto = await service.getDuplicatedMovies();

      expect(result).toEqual({
        min: [
          {
            producer: 'Producer1',
            previousWin: 1980,
            followingWin: 1990,
            interval: 10,
          },
        ],
        max: [
          {
            producer: 'Producer1',
            previousWin: 1980,
            followingWin: 1990,
            interval: 10,
          },
        ],
      });
      expect(movieModel.find).toHaveBeenCalledWith({ winner: 'yes' });
      expect(movieModel.sort).toHaveBeenCalledWith({ year: 1 });
    });
  });

  describe('groupMoviesByProducer', () => {
    it('should group movies by producer', () => {
      const mockMovies: Movie[] = [
        { year: 1980, producers: 'Producer1' } as Movie,
        { year: 1990, producers: 'Producer1' } as Movie,
        { year: 2000, producers: 'Producer2' } as Movie,
      ];

      const result = service.groupMoviesByProducer(mockMovies);

      expect(result).toEqual([
        {
          name: 'Producer1',
          movies: [
            { year: 1980, producers: 'Producer1' },
            { year: 1990, producers: 'Producer1' },
          ],
          interval: 10,
        },
        {
          name: 'Producer2',
          movies: [{ year: 2000, producers: 'Producer2' }],
          interval: 0,
        },
      ]);
    });
  });

  describe('getBigestYearInterval', () => {
    it('should return movies with the largest interval', () => {
      const mockMovies: Movie[] = [
        { year: 1980, producers: 'Producer1' } as Movie,
        { year: 1990, producers: 'Producer1' } as Movie,
        { year: 2000, producers: 'Producer2' } as Movie,
      ];

      jest.spyOn(service, 'groupMoviesByProducer').mockReturnValue([
        { name: 'Producer1', interval: 10, movies: mockMovies.slice(0, 2) },
        { name: 'Producer2', interval: 0, movies: [mockMovies[2]] },
      ]);

      const result = service.getBigestYearInterval(mockMovies);

      expect(result).toEqual([
        {
          producer: 'Producer1',
          previousWin: 1980,
          followingWin: 1990,
          interval: 10,
        },
      ]);
    });
  });

  describe('getSmallYearInterval', () => {
    it('should return movies with the smallest interval', () => {
      const mockMovies: Movie[] = [
        { year: 1980, producers: 'Producer1' } as Movie,
        { year: 1982, producers: 'Producer1' } as Movie,
        { year: 2000, producers: 'Producer2' } as Movie,
      ];

      jest.spyOn(service, 'groupMoviesByProducer').mockReturnValue([
        { name: 'Producer1', interval: 2, movies: mockMovies.slice(0, 2) },
        { name: 'Producer2', interval: 10, movies: [mockMovies[2]] },
      ]);

      const result = service.getSmallYearInterval(mockMovies, 10);

      expect(result).toEqual([
        {
          producer: 'Producer1',
          previousWin: 1980,
          followingWin: 1982,
          interval: 2,
        },
      ]);
    });
  });

  describe('makeWinnerDto', () => {
    it('should map MovieGroup to WinnerDto', () => {
      const mockGroup = [
        {
          name: 'Producer1',
          interval: 10,
          movies: [
            { year: 1980, producers: 'Producer1' } as Movie,
            { year: 1990, producers: 'Producer1' } as Movie,
          ],
        },
      ];

      const result = service.makeWinnerDto(mockGroup);

      expect(result).toEqual([
        {
          producer: 'Producer1',
          previousWin: 1980,
          followingWin: 1990,
          interval: 10,
        },
      ]);
    });
  });
});
