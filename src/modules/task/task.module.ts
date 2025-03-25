import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { MongooseModule } from "@nestjs/mongoose";
import { TaskController } from "./task.controller";
import { TaskService } from "./task.service";
import { Module } from '@nestjs/common';
import { Task, TaskSchema } from "src/schema/task.schema";
import { User, UserSchema } from "src/schema/user.schema";
import { UsersModule } from "../user/users.module";
import { Project, ProjectSchema } from "src/schema/project.schema";
import { ProjectModule } from "../project/project.module";

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Task.name,
        schema: TaskSchema,
      },
    ]),

    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
    ]),

    MongooseModule.forFeature([
      {
        name: Project.name,
        schema: ProjectSchema,
      },
    ]),

    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    ProjectModule
  ],
  providers: [TaskService],
  controllers: [TaskController],
  exports: [TaskService], // Cần export để module khác có thể sử dụng
})
export class TaskModule { }