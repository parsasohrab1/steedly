import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { HORSE_BREEDS } from '@asbaan/shared';

@Controller('v1/breeds')
export class BreedsController {
  @Get()
  findAll() {
    return HORSE_BREEDS;
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    const breed = HORSE_BREEDS.find((b) => b.id === id);
    if (!breed) throw new NotFoundException(`Breed ${id} not found`);
    return breed;
  }
}
