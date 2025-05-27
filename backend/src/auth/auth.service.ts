import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { PasswordService } from '../password/password.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { User } from '../users/entities/user.entity';
import { ServerException } from "./exceptions/constructor.exception";
import { ErrorCode } from "./exceptions/error-constants.exception";

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private passwordService: PasswordService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(username: string, password: string): Promise<User | null> {
    const user = await this.usersService.findOneByUsername(username);

    if (!user) {
      throw new ServerException(ErrorCode.LoginOrPasswordIncorrect);
    }

    const matched = await this.passwordService.verifyPassword(password, user.password)

    if (!matched) {
      throw new ServerException(ErrorCode.LoginOrPasswordIncorrect);
    }

    return user;
  }

  async signup(createUserDto: CreateUserDto) {
    const hashedPassword = await this.passwordService.hashPassword(
      createUserDto.password,
    );

    const { password: _, ...user } = await this.usersService.create({
      ...createUserDto,
      password: hashedPassword,
    });

    return user;
  }

  login(user: User) {
    const payload = { username: user.username, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload, {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: '8h',
      }),
    };
  }
}
