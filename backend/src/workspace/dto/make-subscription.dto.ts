import { Type } from 'class-transformer'
import {
    IsArray,
    IsBoolean,
    IsDateString,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    ValidateNested
} from 'class-validator'
import { Types } from 'mongoose'

export class MemberDto {
    @IsString()
    @IsNotEmpty()
    providerId: string

    @IsString()
    @IsNotEmpty()
    username: string

    @IsOptional()
    @IsBoolean()
    isActive: boolean = true
}

export class AuthorDto {
    @IsString()
    @IsNotEmpty()
    username: string

    @IsString()
    @IsOptional()
    avatarUrl?: string
}

export class RepositoryDto {
    @IsString()
    @IsNotEmpty()
    id: string

    @IsString()
    @IsNotEmpty()
    name: string

    @IsString()
    @IsNotEmpty()
    fullName: string

    @IsString()
    @IsNotEmpty()
    slug: string

    @IsDateString()
    createdOn: string

    @IsDateString()
    updatedOn: string

    @ValidateNested()
    @Type(() => AuthorDto)
    author: AuthorDto

    @IsBoolean()
    private: boolean

    @IsNumber()
    @IsOptional()
    openIssues: number

    _id: Types.ObjectId | any
}

export class MakeSubscriptionDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => MemberDto)
    members: MemberDto[]

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => RepositoryDto)
    repositories: RepositoryDto[]
}
