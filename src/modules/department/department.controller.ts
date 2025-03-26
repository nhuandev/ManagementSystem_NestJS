import { BadRequestException, Body, Controller, Get, Post, Query, Req, UnauthorizedException, UseGuards } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Department } from "src/schema/department.schema";
import { DepartmentService } from "./department.service";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { BaseResponse } from "src/common/base-response";
import { UsersService } from "../user/users.service";

@UseGuards(JwtAuthGuard)
@Controller('api/depart')
export class DepartmentController {
    constructor(
        private departService: DepartmentService,
        private userService: UsersService,
    ) { }

    @Post('create')
    async create(@Body() createDepartDto: Department) {
        await this.departService.createDepart(createDepartDto)

        return {
            statusCode: 200,
            message: 'success'
        }
    }

    @Get('list')
    async list(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 3
    ) {
        try {
            const [departs, total] = await this.departService.getAllDepart(page, limit);

            return {
                data: departs,
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalItems: total,
            }
        } catch (e) {
            throw new UnauthorizedException();
        }
    }

    @Post('delete')
    async deleteDepart(@Body() body: { id: string }) {
        const { id } = body;
        if (!id) {
            return new BaseResponse(400, 'Thiếu ID phòng ban');
        }

        // Kiểm tra xem phòng ban có tồn tại không
        const depart = await this.departService.findOne({ _id: id }); //  Cần dùng { _id: id }
        if (!depart) {
            return new BaseResponse(400, 'Không tìm thấy phòng ban');
        }

        // Kiểm tra xem có user nào thuộc phòng ban này không
        const hasUsers = await this.userService.findOne({ departmentId: id }); //  Cần dùng object
        if (hasUsers) {
            return new BaseResponse(400, 'Không thể xóa phòng ban vì vẫn còn nhân viên thuộc phòng ban này');
        }

        // Nếu không có user nào trong phòng ban, tiến hành xoá
        await this.departService.delete({ _id: id }); //  Cần dùng object { _id: id }
        return new BaseResponse(200, 'Xóa phòng ban thành công');
    }

}