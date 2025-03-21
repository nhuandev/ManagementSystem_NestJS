import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { Department, DepartmentSchema } from 'src/schema/department.schema';
import { DepartmentService } from './department.service';
import { DepartmentController } from './department.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Department.name,
        schema: DepartmentSchema,
      },
    
    ]),

    JwtModule.register({
      secret: 'secret',
      signOptions: {expiresIn: '1d'}
  }),
  ],
  providers: [DepartmentService],
  controllers: [DepartmentController],
  exports: [DepartmentService]
})
export class DepartmentModule {}
