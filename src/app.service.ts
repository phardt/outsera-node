import { BeforeApplicationShutdown, Injectable } from '@nestjs/common';
import { closeInMongodConnection } from './mongo/Mongoose.module';

@Injectable()
export class AppService implements BeforeApplicationShutdown {
  beforeApplicationShutdown() {
    closeInMongodConnection();
  }
}
