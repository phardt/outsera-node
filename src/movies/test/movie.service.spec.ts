/* eslint-disable prettier/prettier */
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { MoviesService } from '../movies.service';
import { Movie } from '../models/movie.schema';

const mockMovieModel = {
  find: jest.fn().mockReturnThis(),
  sort: jest.fn().mockReturnThis(),
  exec: jest.fn(),
};

const mockMovies: Movie[] = [
  { title: 'Movie 1', year: 2000, producers: 'Producer A', winner: 'yes' },
  { title: 'Movie 2', year: 2005, producers: 'Producer A and Producer B', winner: 'yes', },
  { title: 'Movie 3', year: 2011, producers: 'Producer B', winner: 'yes' },
] as unknown as Movie[];

describe('MoviesService', () => {
  let service: MoviesService;
  let movieModel: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MoviesService,
        { provide: getModelToken(Movie.name), useValue: mockMovieModel },
      ],
    }).compile();

    service = module.get<MoviesService>(MoviesService);
    movieModel = module.get(getModelToken(Movie.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getDuplicatedMovies', () => {
    it('should return grouped producers with min and max intervals', async () => {
      movieModel.exec.mockResolvedValue(mockMovies);

      const result = await service.getDuplicatedMovies();

      expect(result).toEqual({
        max: [
          {
            producer: 'Producer B',
            previousWin: 2005,
            followingWin: 2011,
            interval: 6,
          },
        ],
        min: [
          {
            producer: 'Producer A',
            previousWin: 2000,
            followingWin: 2005,
            interval: 5,
          },
        ],
      });
      expect(mockMovieModel.find).toHaveBeenCalledWith({ winner: 'yes' });
    });
  });

  describe('getYearInterval', () => {
    it('should return the group with the max interval', () => {
      const groups = service['groupMoviesByProducer'](mockMovies);
      const result = service['getYearInterval'](groups, 'max', 0);

      expect(result).toEqual([
        {
          producer: 'Producer B',
          previousWin: 2005,
          followingWin: 2011,
          interval: 6,
        },
      ]);
    });

    it('should return the group with the min interval', () => {
      const groups = service['groupMoviesByProducer'](mockMovies);
      const result = service['getYearInterval'](groups, 'min', Infinity);

      expect(result).toEqual([
        {
          producer: 'Producer B',
          previousWin: 2005,
          followingWin: 2011,
          interval: 6,
        },
      ]);
    });
  });

  describe('makeWinnerDto', () => {
    it('should create WinnerDto correctly', () => {
      const mockGroup = [
        {
          name: 'Producer A',
          interval: 5,
          movies: [mockMovies[0], mockMovies[1]],
        },
      ];
      const result = service['makeWinnerDto'](mockGroup);

      expect(result).toEqual([
        {
          producer: 'Producer A',
          previousWin: 2000,
          followingWin: 2005,
          interval: 5,
        },
      ]);
    });
  });
});
