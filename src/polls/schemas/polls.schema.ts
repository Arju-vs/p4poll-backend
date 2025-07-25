import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PollDocument = Poll & Document;

@Schema({ timestamps: true })
export class Poll {
  @Prop({ required: true })
  question: string;

  @Prop({ type: [String], required: true })
  options: string[];

  @Prop({ type: Map, of: Number, default: {} }) 
  votes: Map<string, number>;

  @Prop({ default: false })
  verifiedOnly: boolean

  @Prop({ type: Date, required: true })
  expiresAt: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  votedUsers: Types.ObjectId[];
}

export const PollSchema = SchemaFactory.createForClass(Poll);
