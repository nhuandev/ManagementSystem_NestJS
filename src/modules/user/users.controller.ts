import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpException,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Response, Request } from 'express';
import { User } from 'src/schema/user.schema';
import { BaseResponse } from 'src/common/base-response';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ProjectService } from '../project/project.service';

@Controller('api/user')
export class UsersController {
  constructor(
    private usersService: UsersService,
    private projectService: ProjectService,
    private jwtService: JwtService
  ) { }

  // Login
  @Post('login')
  async login(
    @Body() loginData: { username: string; password: string },
    @Res({ passthrough: true }) response: Response,
  ) {
    const { username, password } = loginData;
    if (!username || !password) {
      throw new BadRequestException(
        new BaseResponse(400, 'Điền tên và mật khẩu'),
      );
    }

    const user = await this.usersService.findOne({ username });
    if (!user) {
      throw new BadRequestException(
        new BaseResponse(400, 'Tài khoản không tồn tại'),
      );
    }

    if (!(await bcrypt.compare(password, user.password))) {
      throw new BadRequestException(
        new BaseResponse(400, 'Tên hoặc mật khẩu sai'),
      );
    }

    const jwt = await this.jwtService.signAsync({ id: user.id });

    response.cookie('jwt', jwt, { httpOnly: true });


    return new BaseResponse(201, 'Đăng nhập thành công', { token: jwt });
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Req() request: Request) {
    const userId = (request.user as any)?.id;
    if (!userId) {
      throw new BadRequestException(new BaseResponse(400, 'Không có ID tài khoản'));
    }

    const user = await this.usersService.findOne({ _id: userId });
    if (!user) {
      throw new BadRequestException(new BaseResponse(400, 'Không tồn tại tài khoản'));
    }

    return new BaseResponse(200, 'Tài khoản người dùng', {
      id: user.id,
      role: user.role,
      username: user.username,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('list')
  async user(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 3
  ) {
    try {
      const [users, total] = await this.usersService.getUsersWithPagination(page, limit);

      return {
        data: users, // users đã có departmentId (tên phòng ban) nhờ `populate()`
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
      };
    } catch (e) {
      throw new UnauthorizedException();
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('delete')
  async deleteUser(@Body() body: { id: string }, @Req() request: Request) {
    const { id } = body;
    if (!id) { 
      return new BaseResponse(400, 'Thiếu ID người dùng');
    }

    const userId = String(request.user.id); // Chuyển ID về cùng kiểu string
    const deleteId = String(id);

    if (userId === deleteId) {
      return new BaseResponse(403, 'Bạn không thể xóa chính mình!');
    }

    // Kiểm tra xem user có tồn tại trong bảng project hay không
    const isUserInProject = await this.projectService.findOne({managerId: deleteId});
    if (isUserInProject) {
      return new BaseResponse(403, 'Người dùng này đang tham gia dự án, không thể xóa!');
    }

    await this.usersService.deleteUser({_id: deleteId});
    return new BaseResponse(200, 'Xóa tài khoản thành công');
  }

  // Tạo tài khoản mới cho nhân sự
  @Post('register')
  async register(
    @Body('username') username: string,
    @Body('email') email: string,
    @Body('password') password: string,
    @Body('role') role: string,
    @Body('departmentId') departmentId: string,
  ) {
    if (!username || username.trim() === '') {
      return new BadRequestException('Username is required');
    }

    if (!email || email.trim() === '') {
      return new BadRequestException('Email is required');
    }

    if (!password || password.trim() === '') {
      return new BadRequestException('Password is required');
    }

    if (!role || role.trim() === '') {
      return new BadRequestException('Role is required');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new BadRequestException('Invalid email format');
    }

    const existingUserByUsername = await this.usersService.findOne({ username });
    if (existingUserByUsername) {
      return new BadRequestException('Username already exists');
    }

    const existingUserByEmail = await this.usersService.findOne({ email });
    if (existingUserByEmail) {
      return new BadRequestException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await this.usersService.createUser({
      username,
      email,
      password: hashedPassword,
      role,
      departmentId,
    });

    delete user.password;

    return new BaseResponse(200, 'Tạo tài khoản thành công', user);
  }


  @Post('logout')
  async logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('jwt');
    return new BaseResponse(200, 'Đăng xuất thành công');
  }


  @Put('update')
  async updateUser(@Query('id') id: string, @Body() updateUserDto: User) {
    if (!id) {
      throw new BadRequestException('Thiếu ID người dùng');
    }
    console.log("ID " + id)
    try {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 12);
      const updatedUser = await this.usersService.update(id, updateUserDto);
      return new BaseResponse(200, 'Cập nhật thành công', updatedUser);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException('Không tìm thấy người dùng');
      }
      console.error('Lỗi cập nhật người dùng:', error);
      throw new InternalServerErrorException('Có lỗi xảy ra khi cập nhật người dùng');
    }
  }


}
