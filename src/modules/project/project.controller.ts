import { Body, Controller, Get, Post, Query, Req, UnauthorizedException, UseGuards, UsePipes, ValidationPipe } from "@nestjs/common";
import { ProjectService } from "./project.service";
import { Project } from "src/schema/project.schema";
import { JwtService } from "@nestjs/jwt";
import { Response, Request } from 'express';
import { UsersService } from "../user/users.service";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { BaseResponse } from "src/common/base-response";
import { type } from "os";

@UseGuards(JwtAuthGuard)
@Controller('api/project')
export class ProjectController {
  constructor(
    private projectService: ProjectService,
    private jwtService: JwtService,
    private usersService: UsersService,
  ) { }

  @Post('create')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async create(@Body() createProjectDto: Project) {
    await this.projectService.createProject(createProjectDto);

    return new BaseResponse(200, 'Tạo dự án thành công');
  }

  @Get('list')
  async list(
    @Query('page') page: number = 1, 
    @Query('limit') limit: number = 3 
  ) {
    try {
      const [projects, total] = await this.projectService.getAllProjects(page, limit)
      return {
        data: projects,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
      };
    } catch (e) {
      throw new UnauthorizedException();
    }
  }
}
