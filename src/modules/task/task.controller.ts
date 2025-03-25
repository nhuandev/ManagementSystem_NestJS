import { Body, Controller, Get, Post, Query, UnauthorizedException, UseGuards } from "@nestjs/common";
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
        private usersService: UsersService,
        private projectService: ProjectService
    ) { }

    @Post('/create')
    async createTask(@Body() taskData: Task) {
        await this.taskService.createTask(taskData);
        return new BaseResponse(200, 'Tạo nhiệm vụ thành công');
    }

    @Get('/list')
    async listTask(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 3
    ) {

        const [tasks, total] = await this.taskService.getAllTasks(page, limit);
        try {
            // Lấy thông tin manager cho từng project
            const dataResponse = await Promise.all(
                tasks.map(async (task) => {
                    if (task.assignedTo) {
                        const user = await this.usersService.findById(task.assignedTo); // Truy vấn user
                        const project = await this.projectService.findById(task.projectId); // Truy vấn project
                        return {
                            ...task.toObject(),
                            assignedTo: user ? user.username : "Unknown", // Gán tên user
                            projectId: project ? project.name : "Unkown", // Gán tên dự án
                        };
                    }
                    return { ...task.toObject(), assignedTo: "No user assigned",  projectId: "No project assigned"};
                })
            );

            return {
                data: dataResponse,
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                status: 200,
            };
        } catch (e) {
            throw new UnauthorizedException();
        }
    }
}