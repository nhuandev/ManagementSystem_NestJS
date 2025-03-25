import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { Types } from "mongoose";

@Schema({ timestamps: true }) 
export class Task extends Document {
  @Prop({ type: Types.ObjectId, required: true, ref: "Project" })
  projectId: Types.ObjectId; 

  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ type: Types.ObjectId, ref: "User" })
  assignedTo: Types.ObjectId; 

  @Prop({ enum: ["todo", "in_progress", "done"], default: "todo" })
  status: "todo" | "in_progress" | "done";

  @Prop({ enum: ["low", "medium", "high"], default: "medium" })
  priority: "low" | "medium" | "high";

  @Prop()
  deadline: Date;
}

export const TaskSchema = SchemaFactory.createForClass(Task);
