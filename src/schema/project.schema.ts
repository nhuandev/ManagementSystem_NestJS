import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true }) 
export class Project {
  toObject(): any {
    throw new Error("Method not implemented.");
  }
  @Prop({ required: true })
  @IsString()
  @IsNotEmpty()
  name: string;

  @Prop()
  @IsOptional()
  @IsString()
  description?: string;

  @Prop()
  @IsNotEmpty()
  startDate: string;

  @Prop()
  @IsOptional()
  endDate?: string;

  @Prop()
  @IsOptional()
  status?: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  @IsString()
  @IsNotEmpty()
  managerId: Types.ObjectId;
 
  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], required: true})
  @IsOptional()
  @IsArray()
  teamMembers?: Types.ObjectId[];
}

export type ProjectDocument = Project & Document;
export const ProjectSchema = SchemaFactory.createForClass(Project);

