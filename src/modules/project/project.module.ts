import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/schema/user.schema';
import { JwtModule } from '@nestjs/jwt';
import { Project, ProjectSchema } from 'src/schema/project.schema';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { UsersModule } from "../user/users.module"; 

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

    JwtModule.register({
      secret: 'secret',
      signOptions: {expiresIn: '1d'}
  }),
    UsersModule
  ],
  providers: [ProjectService],
  controllers: [ProjectController],
})
export class ProjectModule {}
