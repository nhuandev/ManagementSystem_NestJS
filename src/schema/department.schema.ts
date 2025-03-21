import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { IsNotEmpty, IsString } from "class-validator";
import { Document } from "mongoose";

@Schema({ timestamps: true })
export class Department extends Document {

    @Prop()
    @IsString()
    @IsNotEmpty()
    departName: string;

    @Prop()
    @IsString()
    @IsNotEmpty()
    description: string;

    @Prop({ default: true })
    isActive?: boolean;
}

export const DepartmentSchema = SchemaFactory.createForClass(Department);
