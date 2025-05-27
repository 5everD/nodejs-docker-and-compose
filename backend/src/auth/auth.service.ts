import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { PasswordService } from '../password/password.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly passwordService: PasswordService,
    private readonly jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(username: string, password: string): Promise<User | null> {
    const user = await this.usersService.findOneByUsername(username);
    if (
      user &&
      (await this.passwordService.verifyPassword(password, user.password))
    ) {
      return user;
    }
    return null;
  }

  async signup(createUserDto: CreateUserDto) {
    const hashedPassword = await this.passwordService.hashPassword(
      createUserDto.password,
    );

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
        expiresIn: this.configService.get('JWT_EXPIRATION_TIME'),
      }),
    };
  }
}
