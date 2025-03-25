import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './modules/user/users.module';
import { ProjectModule } from './modules/project/project.module';
import { DepartmentModule } from './modules/department/department.moudle';
import { JwtModule } from '@nestjs/jwt';
import { TaskModule } from './modules/task/task.module';
import { ConfigModule } from '@nestjs/config';
@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/mydb'),
    ConfigModule.forRoot({
      isGlobal: true, // Biến môi trường dùng được toàn cục
    }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      // signOptions: { expiresIn: '24h' }, // Hết hạn sau 1 giờ
    }),
    UsersModule,
    ProjectModule, 
    DepartmentModule,
    TaskModule,
  ],
  
  controllers: [],
  providers: [], 
})
export class AppModule {}
