import { IsMongoId, IsString } from "class-validator";

export class VotePollDto {
    @IsMongoId()
    pollId: string;

    @IsString()
    selectedOption: string;
}