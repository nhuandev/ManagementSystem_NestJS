import {
  BadRequestException,
  Body,
  Controller,
  Delete,
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
import { DepartmentService } from '../department/department.service';
import { User } from 'src/schema/user.schema';
import { BaseResponse } from 'src/common/base-response';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { request } from 'http';

@Controller('api/user')
export class UsersController {
  constructor(
    private usersService: UsersService,
    private departService: DepartmentService,
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
        new BaseResponse(400, 'username and password are required'),
      );
    }

    const user = await this.usersService.findOne({ username });
    if (!user) {
      throw new BadRequestException(
        new BaseResponse(400, 'Account does not exist'),
      );
    }

    if (!(await bcrypt.compare(password, user.password))) {
      throw new BadRequestException(
        new BaseResponse(400, 'Email or password incorrect'),
      );
    }

    const jwt = await this.jwtService.signAsync({ id: user.id });

    response.cookie('jwt', jwt, { httpOnly: true });


    return new BaseResponse(201, 'Login successfully', { token: jwt });
  }


  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Req() request: Request) {
    const userId = (request.user as any)?.id;
    if (!userId) {
      throw new BadRequestException(new BaseResponse(400, 'User ID not found in token'));
    }

    const user = await this.usersService.findOne({ _id: userId });
    if (!user) {
      throw new BadRequestException(new BaseResponse(400, 'User not found'));
    }

    return new BaseResponse(200, 'User profile', {
      id: user.id,
      role: user.role,
      username: user.username,
    });
  }

  @Get('list')
  async user(
    @Req() request: Request,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 3
  ) {
    try {
      const cookie = request.cookies['jwt'];

      const data = await this.jwtService.verifyAsync(cookie); 

      if (!data) {
        throw new UnauthorizedException();
      }
      // Lấy danh sách user kèm thông tin phòng ban
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


  @Post('delete')
  async deleteUser(
    @Body('username') username: string,
  ) {
    await this.usersService.deleteUser(username);
    return {
      statusCode: 200,
      message: 'Success'
    }
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
      throw new BadRequestException('Username is required');
    }

    if (!email || email.trim() === '') {
      throw new BadRequestException('Email is required');
    }

    if (!password || password.trim() === '') {
      throw new BadRequestException('Password is required');
    }

    if (!role || role.trim() === '') {
      throw new BadRequestException('Role is required');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new BadRequestException('Invalid email format');
    }

    const existingUserByUsername = await this.usersService.findOne({ username });
    if (existingUserByUsername) {
      throw new BadRequestException('Username already exists');
    }

    const existingUserByEmail = await this.usersService.findOne({ email });
    if (existingUserByEmail) {
      throw new BadRequestException('Email already exists');
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

    return user;
  }


  @Post('logout')
  async logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('jwt');
    return {
      message: 'success'
    }
  }


  @Put('update')
  async updateUser(@Query('id') id: string, @Body() updateUserDto: User) {
    if (!id) {
      throw new BadRequestException('Thiếu ID người dùng');
    }
    console.log("ID "+id)
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
