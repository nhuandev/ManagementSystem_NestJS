import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Project } from "src/schema/project.schema";

@Injectable()
export class ProjectService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<Project>,
  ) { }

  async findOne(condition: any) {
    return this.projectModel.findOne(condition);
  }

  async createProject(createProjectDto: any): Promise<Project> {
    const newProject = new this.projectModel(createProjectDto);
    return newProject.save();
  }

  async getAllProjects(page: number, limit: number): Promise<[Project[], number]> {
    const skip = (page - 1) * limit;
    const total = await this.projectModel.countDocuments();

    const projects = await this.projectModel
      .find()
      .populate('managerId', 'username')
      .populate({ path: 'teamMembers', model: 'User', select: 'username' }) // Populate teamMembers
      .skip(skip)
      .limit(limit)
      .lean(); // Lấy dữ liệu JSON thuần

    return [projects, total];
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
