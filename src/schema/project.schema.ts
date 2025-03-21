import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsArray, IsDate, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true }) 
export class Project extends Document {
  @Prop({ required: true })
  @IsString()
  @IsNotEmpty()
  name: string;

  @Prop()
  @IsOptional()
  @IsString()
  description?: string;

  @Prop({ required: true })
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
  managerId: string;

  // Lưu ID 
  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  @IsOptional()
  @IsArray()
  teamMembers?: string[];
}

export const ProjectSchema = SchemaFactory.createForClass(Project);

