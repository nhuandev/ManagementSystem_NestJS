import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User, UserSchema } from 'src/schema/user.schema';
import { JwtModule } from '@nestjs/jwt';
import { Department, DepartmentSchema } from 'src/schema/department.schema';
import { DepartmentModule } from '../department/department.moudle';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
    
    ]),

    MongooseModule.forFeature([
      {
        name: Department.name,
        schema: DepartmentSchema,
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
  forwardRef(() => DepartmentModule), // Dùng forwardRef để tránh vòng lặp
  ],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
