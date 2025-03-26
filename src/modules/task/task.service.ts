import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Task } from "src/schema/task.schema";

@Injectable()
export class TaskService {
    constructor(
        @InjectModel(Task.name) private taskModel: Model<Task>, 
    ) {}

    async createTask(taskData: Task){
        this.taskModel.create(taskData);
    }

    async getAllTasks(page: number, limit: number): Promise<[Task[], number]> {
        const skip = (page - 1) * limit;
        const total = await this.taskModel.countDocuments();
        const task = await this.taskModel
          .find()
          .populate('projectId', 'name')
          .populate('assignedTo', 'username')
          .skip(skip)
          .limit(limit);
    
        return [task, total];
      }
}