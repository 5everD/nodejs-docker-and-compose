import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';

import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.auth.guard';
import { WishesService } from '../wishes/wishes.service';
import { PasswordService } from '../password/password.service';
import { User } from './entities/user.entity';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly wishesService: WishesService,
    private readonly passwordService: PasswordService,
  ) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get(':username')
  findOne(@Param('username') username: string) {
    return this.usersService.findOneByUsername(username);
  }

  @Patch(':id')
  updateOne(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.updateOne(+id, updateUserDto);
  }

  @Delete(':id')
  removeOne(@Param('id') id: string) {
    return this.usersService.removeOne(+id);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get('me')
  async getCurrentUser(@Req() req: { user: User }) {
    return await this.usersService.findOne(req.user.id);
  }

  @Patch('me')
  async updateMe(
    @Req() req: { user: User },
    @Body() updateUserDto: UpdateUserDto,
  ) {
    if ('password' in updateUserDto) {
      updateUserDto.password = await this.passwordService.hashPassword(
        updateUserDto.password!,
      );
    }

    return this.usersService.updateOne(req.user.id, updateUserDto);
  }

  @Get('me/wishes')
  async findMeWishes(@Req() req: { user: User }) {
    return await this.wishesService.findUserWishes(req.user);
  }

  @Get(':username/wishes')
  async findOneWithWishes(@Param('username') username: string) {
    const user = await this.usersService.findOneByUsername(username);

    return this.wishesService.findUserWishes(user!);
  }

  @Post('find')
  async find(@Body() body: { query: string }) {
    return this.usersService.findManyByQuery(body.query);
  }
}
