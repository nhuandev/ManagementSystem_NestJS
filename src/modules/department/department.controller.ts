import { BadRequestException, Body, Controller, Get, Post, Query, Req, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Department } from "src/schema/department.schema";
import { DepartmentService } from "./department.service";


@Controller('api/depart')
export class DepartmentController {
    constructor(
        private departService: DepartmentService,
        private jwtService: JwtService,
    ) { }

    @Post('create')
    async create(@Body() createDepartDto: Department) {
        // const checkDepart = this.departService.findOne({ name: createDepartDto.departName })

        // if (checkDepart) {
        //     return {
        //         statusCode: 400,
        //         message: 'Department already exists'
        //     };
        // }

        await this.departService.createDepart(createDepartDto)
        
        return {
            statusCode: 200,
            message: 'success'
        }
    }

    @Get('list')
    async list(
        @Req() request: Request,
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