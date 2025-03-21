import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './modules/user/users.module';
import { ProjectModule } from './modules/project/project.module';
import { Department } from './schema/department.schema';
import { DepartmentModule } from './modules/department/department.moudle';
@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/mydb'),
    UsersModule,
    ProjectModule,
    DepartmentModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
