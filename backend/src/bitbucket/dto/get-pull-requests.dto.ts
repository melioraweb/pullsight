import { IsIn, IsNumber, IsOptional, IsString } from 'class-validator'

export class GetPullRequestsDto {
    @IsString()
    workspace: string

    @IsString()
    repository: string

    @IsOptional()
    @IsIn(['OPEN', 'MERGED', 'DECLINED', 'SUPERSEDED'])
    state?: 'OPEN' | 'MERGED' | 'DECLINED' | 'SUPERSEDED'

    @IsOptional()
    @IsNumber()
    limit?: number
}
