import { IsArray, IsBoolean, IsInt, IsNotEmpty, IsOptional, Max, Min } from "class-validator";

export class CreatePollDto {
    @IsNotEmpty()
    question: string;

    @IsArray()
    options: string[];

    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(120)
    duration?: number

    @IsOptional()
    @IsBoolean()
    verifiedOnly?: boolean

}