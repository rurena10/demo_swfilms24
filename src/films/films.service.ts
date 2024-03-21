import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateFilmDto } from './dto/create-film.dto';
import { UpdateFilmDto } from './dto/update-film.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsOrderValue, Repository } from 'typeorm';
import { Film } from './entities/film.entity';
import { PaginationDto } from 'src/helpers/dtos/pagination.dto';
import { isUUID } from 'class-validator';

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

  async findAll(paginationDto: PaginationDto) {
    const {limit = 5, skip=0, order='ASC', query} = paginationDto;

    if (!query){
      return await this.filmsRepository.find({
        skip,
        take: limit,
        order: {
          episode_id: order as FindOptionsOrderValue
        }
      });
    } else{

      let films : Film[];
      const queryBuilder = this.filmsRepository.createQueryBuilder('film');
      films = await queryBuilder
        .where('LOWER(director) ilike :director', {director: `%${query.toLowerCase()} %`})
        .orWhere('LOWER(title) ilike :title', {title: `%${query.toLowerCase()} %`})
        .limit(limit)
        .skip(skip)
        .getMany();

      return films;
    }
    
  }

  async findOne(id: string) {

    let film: Film;

    if(isUUID(id)){
      film = await this.filmsRepository.findOneBy({id});
    }
    else{
      film = await this.filmsRepository.findOneBy({episode_id: +id});
    }
    
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
