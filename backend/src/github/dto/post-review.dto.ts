import { Type } from 'class-transformer'
import {
    IsArray,
    IsNotEmpty,
    IsNumber,
    IsString,
    ValidateNested
} from 'class-validator'

export class ReviewComment {
    @IsString()
    path: string

    @IsNumber()
    line: number

    @IsString()
    body: string
}

export class PostReviewDto {
    @IsString()
    @IsNotEmpty()
    owner: string

    @IsString()
    @IsNotEmpty()
    repo: string

    @IsNumber()
    @IsNotEmpty()
    prNumber: number

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ReviewComment)
    comments: ReviewComment[]

    @IsNumber()
    @IsNotEmpty()
    installationId: number
}
