import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from 'src/schema/user.schema';



@Injectable()
export class UsersService {
  // [x: string]: any;
  constructor(@InjectModel(User.name) private userModel: Model<User>,) { }

  async findOne(condition: any): Promise<User> {
    return this.userModel.findOne(condition);
  }

  async getsUsers(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async createUser(userData: any): Promise<User> {
    const newUser = new this.userModel(userData);
    return newUser.save();
  }

  async deleteUser(condition: any): Promise<User> {
    const user = this.userModel.findOne(condition);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user.deleteOne();
  }

  async findById(id: any) {
    try {
      // Convert string ID to MongoDB ObjectId
      if (!Types.ObjectId.isValid(id)) {
        throw new NotFoundException('Invalid user ID');
      }

      const objectId = new Types.ObjectId(id);
      const user = await this.userModel.findById(objectId);

      if (!user) {
        throw new NotFoundException('User not found');
      }

      return user;
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async editUser(userId: string, updateData: User): Promise<User> {
    const updatedUser = await this.userModel.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }

    return updatedUser;
  }

  // Phân trang
  async getUsersWithPagination(page: number, limit: number): Promise<[any[], number]> {
    const skip = (page - 1) * limit;
    const total = await this.userModel.countDocuments();
    const users = await this.userModel
      .find()
      .skip(skip)
      .limit(limit)
      .select('-password');

    return [users, total];
  }

  async update(userId: string, updateData: Partial<User>): Promise<User> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('ID không hợp lệ');
    }
  
    // Lọc bỏ các trường undefined/null để tránh ghi đè dữ liệu quan trọng
    const filteredUpdateData = Object.fromEntries(
      Object.entries(updateData).filter(([_, v]) => v !== undefined && v !== null)
    );
  
    const updatedUser = await this.userModel.findByIdAndUpdate(
      userId,
      { $set: filteredUpdateData },
      { new: true, runValidators: true }
    );
  
    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }
  
    return updatedUser;
  }
  



}
