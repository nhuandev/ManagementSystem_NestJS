import { Body, Controller, Get, Post, Query, UnauthorizedException, UseGuards, UsePipes, ValidationPipe } from "@nestjs/common";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { TaskService } from "./task.service";
import { Task } from "src/schema/task.schema";
import { BaseResponse } from "src/common/base-response";
import { UsersService } from "../user/users.service";
import { ProjectService } from "../project/project.service";

@UseGuards(JwtAuthGuard)
@Controller('api/task')
export class TaskController {
    constructor(
        private taskService: TaskService,
    ) { }

    @Post('/create')
    @UsePipes(new ValidationPipe({ whitelist: true })) 
    async createTask(@Body() taskData: Task) {
        console.log("data "+taskData);
        await this.taskService.createTask(taskData);
        return new BaseResponse(200, 'Tạo nhiệm vụ thành công');
    }

    @Get('/list')
    async listTask(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 3
    ) {
 
        const [tasks, total] = await this.taskService.getAllTasks(page, limit);
        return {
            data: tasks,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalItems: total,
            status: 200,
        }
    }
}