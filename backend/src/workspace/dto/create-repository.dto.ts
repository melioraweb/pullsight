import { Type } from 'class-transformer'
import { IsArray, ValidateNested } from 'class-validator'
import { MemberDto, RepositoryDto } from './make-subscription.dto'

export class CreateRepositoryDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => RepositoryDto)
    repositories: RepositoryDto[]
}

export class CreateMembersDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => MemberDto)
    members: MemberDto[]
}
