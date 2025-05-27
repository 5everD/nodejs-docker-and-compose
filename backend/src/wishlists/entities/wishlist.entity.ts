import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import {
  IsArray,
  IsDate,
  IsInt,
  IsString,
  IsUrl,
  Length,
  Min,
} from 'class-validator';
import { User } from '../../users/entities/user.entity';
import { Wish } from '../../wishes/entities/wish.entity';

@Entity()
export class Wishlist {
  @PrimaryGeneratedColumn()
  @IsInt()
  @Min(0)
  id: number;

  @CreateDateColumn()
  @IsDate()
  createdAt: Date;

  @UpdateDateColumn()
  @IsDate()
  updatedAt: Date;

  @Column()
  @Length(1, 250)
  @IsString()
  name: string;

  @Column({ length: 1500, nullable: true })
  @IsString()
  description: string;

  @Column({ nullable: true })
  @IsUrl()
  image: string;

  @OneToMany(() => Wish, (wish) => wish.wishlist)
  @IsArray()
  items: Wish[];

  @ManyToOne(() => User, (user) => user.wishlists)
  owner: User;
}
