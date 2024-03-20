import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateFilmDto } from './dto/create-film.dto';
import { UpdateFilmDto } from './dto/update-film.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Film } from './entities/film.entity';

@Injectable()
export class FilmsService {
  private readonly logger = new Logger('FilmsService');


  constructor(
    @InjectRepository(Film)
    private filmsRepository: Repository<Film>
  ){}
  async create(createFilmDto: CreateFilmDto) {
    try {
      const film = this.filmsRepository.create(createFilmDto);
      await this.filmsRepository.save(film);
      return film;
    } catch (error) {
      //console.log(error)
      this.manageDBExceptions(error)
    }
    
  }

  findAll() {
    return this.filmsRepository.find({});
  }

  async findOne(id: string) {
    const film = await this.filmsRepository.findOneBy({id});
    if (!film) throw new NotFoundException(`Film with id ${id} not found`);
    return film;
  }

  update(id: number, updateFilmDto: UpdateFilmDto) {
    return `This action updates a #${id} film`;
  }

  remove(id: number) {
    return `This action removes a #${id} film`;
  }

  private manageDBExceptions(error: any)
  {
    this.logger.error(error.message, error.stack);
    if (error.code === '23505')throw new BadRequestException(error.detail);
    throw new InternalServerErrorException('Internal Server Error');
  }
}
