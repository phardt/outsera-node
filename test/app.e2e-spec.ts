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
    it('/ (GET)', async () => {
      const movies = await request(await app.getHttpServer()).get('/movies');
      console.log(movies.body);
    });
  });

  afterAll(() => {
    closeInMongodConnection();
  });
});
