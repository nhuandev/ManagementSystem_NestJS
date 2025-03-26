import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Project } from "src/schema/project.schema";

@Injectable()
export class ProjectService {
  [x: string] : any;
  constructor(
    @InjectModel(Project.name) private projectModel: Model<Project>, 
) {}


  async createProject(createProjectDto: any): Promise<Project> {
    const newProject = new this.projectModel(createProjectDto);
    return newProject.save();
  }

  async getAllProjects(page: number, limit: number): Promise<[Project[], number]> {
    const skip = (page - 1) * limit;
    const total = await this.projectModel.countDocuments();
    const project = await this.projectModel
      .find()
      .populate('managerId', 'username') 
      .skip(skip)
      .limit(limit);

    return [project, total];
  }

  async findById(id: any) {
      try {
        // Convert string ID to MongoDB ObjectId
        if (!Types.ObjectId.isValid(id)) {
          throw new NotFoundException('Invalid project ID');
        }
  
        const objectId = new Types.ObjectId(id);
        const project = await this.projectModel.findById(objectId);
  
        if (!project) {
          throw new NotFoundException('project not found');
        }
  
        return project;
      } catch (error) {
        throw new NotFoundException(error.message);
      }
    }
}
