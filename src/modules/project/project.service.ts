import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
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
      .skip(skip)
      .limit(limit);

    return [project, total];
  }
}
