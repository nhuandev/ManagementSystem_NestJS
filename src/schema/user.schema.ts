import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsNotEmpty, IsString } from 'class-validator';
import { Types } from 'mongoose';

@Schema({timestamps: true})
export class User {

  @Prop()
  id: string;

  @Prop()
  username: string;

  @Prop()
  email: string;

  @Prop()
  password: string;

  @Prop()
  role: string;

  @Prop({ type: Types.ObjectId, ref: 'Department', required: true })
  @IsString()
  @IsNotEmpty()
  departmentId: string;
}

export const UserSchema = SchemaFactory.createForClass(User);


