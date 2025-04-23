import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/schema/user.schema';
import { JwtModule } from '@nestjs/jwt';
import { Project, ProjectSchema } from 'src/schema/project.schema';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { UsersModule } from "../user/users.module"; 
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Project.name,
        schema: ProjectSchema,
      },
    
    ]),

    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
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
     forwardRef(() => UsersModule), // Dùng forwardRef để tránh vòng lặp
  ],
  providers: [ProjectService],
  controllers: [ProjectController],
  exports: [ProjectService] // Cần export để module khác có thể sử dụng
})
export class ProjectModule {}
