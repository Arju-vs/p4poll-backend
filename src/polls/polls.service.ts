import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Poll, PollDocument } from './schemas/polls.schema';
import { Model, Types } from 'mongoose';
import { CreatePollDto } from './dto/polls.dto';
import { VotePollDto } from './dto/vote.dto';

@Injectable()
export class PollsService {
    constructor(@InjectModel(Poll.name) private pollModel: Model<PollDocument>) {}

    async createPoll(dto: CreatePollDto, user: any) {
         if(user.role !== 'admin') {
            throw new ForbiddenException('Only admins can create polls')
         }

         const durationInMinutes = dto.duration || 120;
         const durationInMs = Math.min(durationInMinutes, 120) * 60 *1000

         const poll = new this.pollModel({
            question: dto.question,
            options: dto.options,
            votes: dto.options.reduce((acc, opt)=>{
                acc[opt] = 0;
                return acc
            },{}),
            expiresAt: new Date(Date.now() + durationInMs ),
            createdBy: new Types.ObjectId(user.userId),
            verifiedOnly: dto.verifiedOnly || false
         })
         return poll.save()
    }

async votePoll(dto: VotePollDto, userId: string) {
  const poll = await this.pollModel.findById(dto.pollId);

  if (!poll) throw new NotFoundException("Poll not found!");
  if (poll.expiresAt < new Date()) throw new ForbiddenException('Poll has expired!');
  if (!poll.options.includes(dto.selectedOption))
    throw new BadRequestException('Invalid option');

  // ✅ Ensure votedUsers is always an array
  poll.votedUsers = poll.votedUsers?.filter(Boolean) || [];

  // ✅ Convert both to string before comparing
  const alreadyVoted = poll.votedUsers.some(
    id => id?.toString() === userId?.toString()
  );

  if (alreadyVoted) {
    throw new ForbiddenException('You have already voted!');
  }

  // ✅ Add vote
  poll.votes.set(
    dto.selectedOption,
    (poll.votes.get(dto.selectedOption) || 0) + 1
  );

  // ✅ Add current user
  poll.votedUsers.push(new Types.ObjectId(userId));
  console.log("votedUsers:", poll.votedUsers.map(id => id?.toString()));
    console.log("current user:", userId);

  await poll.save();

  return { success: true, message: 'Poll Voted Successfully!', poll };
}



    async getAllPolls() {
        const polls = await this.pollModel.find().populate('createdBy', 'name email').sort({ createdAt: -1})

        const mappedPolls = polls.map(poll => ({
            id: poll._id,
            question: poll.question,
            options: poll.options,
            totalVotes: [...poll.votes.values()].reduce((sum, val) => sum + val, 0),
            expiresAt: poll.expiresAt,
            verifiedOnly: poll.verifiedOnly,
            createdBy: poll.createdBy,
            votedUsers: poll.votedUsers.map(user => user.toString()),
        }));

        const verifiedPolls = mappedPolls.filter(poll => poll.verifiedOnly);
        const nonVerifiedPolls = mappedPolls.filter(poll => !poll.verifiedOnly);

        return {
            allPolls: mappedPolls,
            verifiedPolls,
            nonVerifiedPolls,
        };
    }


    async getPollResult(pollId: string) {
        const poll = await this.pollModel.findById(pollId)
        if(!poll) throw new NotFoundException('Poll Not Found!')

        if(poll.expiresAt > new Date()){
            throw new ForbiddenException('Results will be available after the poll expires')
        }
        return {
            question: poll.question,
            totalVotes: [...poll.votes.values()].reduce((sum, val)=> sum + val, 0),
            results: Object.fromEntries(poll.votes),
            expiredAt: poll.expiresAt
        }
    }
   
    async editPoll(pollId: string, dto: CreatePollDto) {
        const poll = await this.pollModel.findById(pollId)
        if(!poll) throw new NotFoundException("Poll Not Found!!")
        if (poll.expiresAt < new Date()) {
        throw new ForbiddenException("Cannot edit an expired poll!");
        }
        
        const duration = dto.duration ?? 2
        poll.question = dto.question;
        poll.options = dto.options
        poll.votes = new Map(Object.entries(dto.options.reduce((acc, opt) => {
            acc[opt] = 0;
            return acc;
        }, {})))
        poll.verifiedOnly = dto.verifiedOnly ?? poll.verifiedOnly;
        poll.expiresAt = new Date(Date.now() + duration * 60 * 60 *1000)

        await poll.save()
        return { success: true, message: "Poll updated successfully", poll };
    }

    async deletePoll(pollId: string, user: any) {
        const poll = await this.pollModel.findById(pollId);
        if(!poll) throw new NotFoundException('Poll not found!!')
        
        await poll.deleteOne()
        return { success: true, message: 'Poll deleted successfully!'}
    }

}
