import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import {
  closeInMongodConnection,
  rootMongooseModule,
} from '../src/mongo/Mongoose.module';
import { SeedersService } from '../src/movies/seeders/seeders.service';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let seederService: SeedersService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [rootMongooseModule(), AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    seederService = moduleFixture.get<SeedersService>(SeedersService);
    await seederService.readMovies();
    await app.init();
  });

  describe('Movie Endpoint', () => {
    const result = {
      min: [
        {
          producer: 'Bo Derek',
          followingWin: 1990,
          previousWin: 1984,
          interval: 6,
        },
      ],
      max: [
        {
          producer: 'Bo Derek',
          followingWin: 1990,
          previousWin: 1984,
          interval: 6,
        },
      ],
    };

    it('/ (GET)', async () => {
      const requestResponse = await request(await app.getHttpServer()).get('/movies');
      console.log(requestResponse.body);
      expect(requestResponse.body).toEqual(result);
    });
  });

  afterAll(() => {
    closeInMongodConnection();
  });
});
