import { BadRequestException, Body, Controller, Get, Post, Query, Req, UnauthorizedException, UseGuards } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Department } from "src/schema/department.schema";
import { DepartmentService } from "./department.service";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";

@UseGuards(JwtAuthGuard)
@Controller('api/depart')
export class DepartmentController {
    constructor(
        private departService: DepartmentService,
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

}