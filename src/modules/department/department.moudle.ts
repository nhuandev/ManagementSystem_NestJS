import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { Department, DepartmentSchema } from 'src/schema/department.schema';
import { DepartmentService } from './department.service';
import { DepartmentController } from './department.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User, UserSchema } from 'src/schema/user.schema';
import { UsersModule } from '../user/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Department.name, schema: DepartmentSchema },
    ]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),

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
  providers: [DepartmentService],
  controllers: [DepartmentController],
  exports: [DepartmentService],
})
export class DepartmentModule {}
