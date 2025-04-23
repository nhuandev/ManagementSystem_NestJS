import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";
import { IsNotEmpty, IsObject, IsString } from "class-validator";
import { Types } from "mongoose";

@Schema({ timestamps: true })
export class Task {
  @Prop({ type: Types.ObjectId, required: true, ref: "Project" })
  @IsNotEmpty()
  projectId: Types.ObjectId;

  @Prop()
  @IsString()
  @IsNotEmpty()
  name: string;

  @Prop()
  @IsString()
  @IsNotEmpty()
  description: string;

  @Prop({ type: Types.ObjectId, ref: "User" })
  @IsNotEmpty()
  assignedTo: Types.ObjectId;

  @Prop({ enum: ["todo", "in_progress", "done"], default: "todo" })
  status: "todo" | "in_progress" | "done";

  @Prop({ enum: ["low", "medium", "high"], default: "medium" })
  priority: "low" | "medium" | "high";

  @Prop() 
  @IsString()
  @IsNotEmpty()
  deadline: Date;
}

export const TaskSchema = SchemaFactory.createForClass(Task);
