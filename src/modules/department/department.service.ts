import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Department } from "src/schema/department.schema";

@Injectable()
export class DepartmentService {
  constructor(
    @InjectModel(Department.name) private departModel: Model<Department>,
  ) { }

  async createDepart(createDepartDto: any): Promise<Department> {
    const newDepart = new this.departModel(createDepartDto);
    return newDepart.save()
  }

  async getAllDepart(page: number, limit: number): Promise<[Department[], number]> {
    const skip = (page - 1) * limit;
    const total = await this.departModel.countDocuments();
    const depart = await this.departModel
      .find()
      .skip(skip)
      .limit(limit);
    return [depart, total];
  }

  async findOne(condition: any): Promise<Department> {

    try {
      if (!Types.ObjectId.isValid(condition)) {
        throw new NotFoundException('Invalid depart ID');
      }

      const objectId = new Types.ObjectId(condition);
      const depart = await this.departModel.findById(objectId);

      if (!depart) {
        throw new NotFoundException('Depart not found');
      }

      return depart;
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }
}