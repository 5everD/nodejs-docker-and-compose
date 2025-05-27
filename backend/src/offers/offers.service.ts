import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Offer } from './entities/offer.entity';
import { User } from '../users/entities/user.entity';
import { Wish } from '../wishes/entities/wish.entity';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';

@Injectable()
export class OffersService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Offer)
    private readonly offerRepository: Repository<Offer>,
    @InjectRepository(Wish)
    private readonly wishRepository: Repository<Wish>,
  ) {}

  async create(
    createOfferDto: CreateOfferDto,
    user: User,
  ): Promise<Offer | undefined> {
    const wish = await this.wishRepository.findOne({
      where: { id: createOfferDto.itemId },
      relations: {
        owner: true,
      },
    });

    if (!wish) {
      throw new NotFoundException('Такого подарка не существует');
    }

    if (wish.owner.id === user.id) {
      throw new BadRequestException('Самому себе скидывать нельзя!');
    }

    const raised = +wish.raised + +createOfferDto.amount;

    if (raised > wish.price) {
      throw new BadRequestException('Размер вклада слишком большой');
    }

    wish.raised = raised;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const insertedOffer = await queryRunner.manager.insert(Offer, {
        amount: createOfferDto.amount,
        hidden: createOfferDto.hidden,
        user,
        item: wish,
      });
      await queryRunner.manager.save(wish);
      await queryRunner.commitTransaction();

      return await this.findOne(insertedOffer.identifiers[0].id as number);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new Error('Что-то пошло не так');
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(): Promise<Offer[]> {
    return await this.offerRepository.find();
  }

  async findOne(id: number): Promise<Offer | undefined> {
    const offer = await this.offerRepository.findOne({ where: { id } });

    if (!offer) {
      throw new NotFoundException('Такого предложения не существует');
    }

    return offer;
  }

  async update(
    id: number,
    updateOfferDto: UpdateOfferDto,
  ): Promise<Offer | null> {
    await this.offerRepository.update(id, updateOfferDto);
    return await this.offerRepository.findOne({ where: { id } });
  }

  async remove(id: number): Promise<void> {
    await this.offerRepository.delete(id);
  }
}
