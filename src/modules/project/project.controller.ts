import { Body, Controller, Get, Post, Query, Req, UnauthorizedException } from "@nestjs/common";
import { ProjectService } from "./project.service";
import { Project } from "src/schema/project.schema";
import { JwtService } from "@nestjs/jwt";
import { Response, Request } from 'express';
import { UsersService } from "../user/users.service";

@Controller('api/project')
export class ProjectController {
  constructor(
    private projectService: ProjectService,
    private jwtService: JwtService,
    private usersService: UsersService,
  ) { }

  @Post('create')
  async create(@Body() createProjectDto: Project) {
    await this.projectService.createProject(createProjectDto);

    return {
      statusCode: 200,
      message: 'Success'
    }
  }

  @Get('list')
  async list(
    @Req() request: Request,
    @Query('page') page: number = 1, // Mặc định page = 1
    @Query('limit') limit: number = 3 // Mặc định mỗi trang 
  ) {
    try {
      const cookie = request.cookies['jwt'];

      const data = await this.jwtService.verifyAsync(cookie);

      if (!data) {
        throw new UnauthorizedException();
      }

      const [projects, total] = await this.projectService.getAllProjects(page, limit)

      // Lấy thông tin manager cho từng project
      const projectsWithManager = await Promise.all(
        projects.map(async (project) => {
          if (project.managerId) {
            const manager = await this.usersService.findById(project.managerId);
            return {
              ...project.toObject(),
              managerId: manager ? manager.username : "Unknown" 
            };
          }
          return { ...project.toObject(), managerId: "No manager assigned" };
        })
      );

      return {
        data: projectsWithManager,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
      };
    } catch (e) {
      throw new UnauthorizedException();
    }
  }
}
