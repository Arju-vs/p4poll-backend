import { Body, Controller, Delete, Get, Param, Post, Put, Request, UseGuards } from '@nestjs/common';
import { PollsService } from './polls.service'; 
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreatePollDto } from './dto/polls.dto';
import { AdminGuard } from 'src/auth/admin.guard';
import { VotePollDto } from './dto/vote.dto';

@Controller('polls')
export class PollsController {
    constructor(private pollService: PollsService) {}

@Post('create')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async createPoll(@Body() dto: CreatePollDto, @Request() req) {
    return this.pollService.createPoll(dto, req.user);
    }

@Post('vote')
  @UseGuards(JwtAuthGuard)
  async vote(@Body() dto: VotePollDto, @Request() req) {
    const userId = req.user.userId
    return this.pollService.votePoll(dto, userId);
  }

@Get('all-polls')
  @UseGuards(JwtAuthGuard)
  async getAllResults() {
    return this.pollService.getAllPolls()
  }

@Get(':id/result')
  @UseGuards(JwtAuthGuard)
  async getPollResult(@Param('id') id: string){
    return this.pollService.getPollResult(id);
  }

@Put('edit/:id')
@UseGuards(JwtAuthGuard, AdminGuard)
async editPoll(@Param('id') id: string, @Body() dto: CreatePollDto, @Request() req){
  return this.pollService.editPoll(id, dto)
}

@Delete('delete/:id')
@UseGuards(JwtAuthGuard, AdminGuard)
async deletePoll(@Param('id') id: string, @Request() req) {
  return this.pollService.deletePoll(id, req.user)
}

}
