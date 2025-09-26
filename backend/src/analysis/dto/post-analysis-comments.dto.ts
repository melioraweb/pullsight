import { Type } from 'class-transformer'
import {
    IsArray,
    IsMongoId,
    IsNumber,
    IsObject,
    IsOptional,
    IsString,
    ValidateNested
} from 'class-validator'

export class CommentDto {
    @IsString()
    filePath: string

    @IsNumber()
    lineStart: number

    @IsOptional()
    @IsNumber()
    lineEnd: number

    @IsString()
    content: string

    @IsOptional()
    @IsString()
    codeSnippet: string

    @IsOptional()
    @IsNumber()
    codeSnippetLineStart: number

    @IsString()
    severity: string

    @IsOptional()
    @IsObject()
    metadata: any

    @IsString()
    category: string
}

export class PullRequestAnalysisCommentsDto {
    @IsMongoId()
    pullRequestAnalysisId: string

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CommentDto)
    comments: CommentDto[]

    @IsOptional()
    @IsObject()
    modelInfo?: any

    @IsOptional()
    @IsObject()
    usageInfo?: any

    @IsOptional()
    @IsNumber()
    completed: number
}
