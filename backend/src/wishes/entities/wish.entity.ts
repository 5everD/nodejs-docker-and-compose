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
  IsDecimal,
  IsInt,
  IsString,
  IsUrl,
  Length,
  Min,
} from 'class-validator';
import { Offer } from '../../offers/entities/offer.entity';
import { User } from '../../users/entities/user.entity';
import { Wishlist } from '../../wishlists/entities/wishlist.entity';

@Entity()
export class Wish {
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

  @Column()
  @IsUrl()
  link: string;

  @Column()
  @IsUrl()
  image: string;

  @Column('decimal', { precision: 10, scale: 2 })
  @IsDecimal()
  price: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  @IsDecimal()
  raised: number;

  @ManyToOne(() => User, (user) => user.wishes)
  owner: User;

  @Column()
  @Length(1, 1024)
  @IsString()
  description: string;

  @OneToMany(() => Offer, (offer) => offer.item)
  @IsArray()
  offers: Offer[];

  @Column('int', { default: 0 })
  @IsInt()
  copied: number;

  @ManyToOne(() => Wishlist, (list) => list.items)
  wishlist: Wishlist;
}
