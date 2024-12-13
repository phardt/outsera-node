import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Movie extends Document {
  @Prop()
  year: number;

  @Prop()
  title: string;

  @Prop()
  producers: string;

  @Prop()
  studio: string;

  @Prop()
  winner: string;
}

export const MovieSchema = SchemaFactory.createForClass(Movie);
