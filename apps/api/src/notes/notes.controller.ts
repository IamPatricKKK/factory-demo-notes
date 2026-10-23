import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Post } from '@nestjs/common';
import { NotesService } from './notes.service.js';
import { CreateNoteDto } from './note.dto.js';

@Controller('notes')
export class NotesController {
  constructor(private readonly notes: NotesService) {}

  @Get()
  findAll() {
    return this.notes.findAll();
  }

  @Post()
  create(@Body() dto: CreateNoteDto) {
    return this.notes.create(dto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.notes.remove(id);
  }
}
