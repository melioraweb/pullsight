import { Transform } from 'class-transformer'
import {
    IsDateString,
    IsIn,
    IsInt,
    IsMongoId,
    IsOptional,
    Min
} from 'class-validator'

export class DashboardFilterDto {
    @IsOptional()
    repo: string

    @IsOptional()
    @IsDateString()
    from: string

    @IsOptional()
    @IsDateString()
    to: string

    @IsOptional()
    @IsIn(['day', 'month', 'year'])
    breakdown?: 'day' | 'month' | 'year'
}

export class PrAnalysisCardFilterDto extends DashboardFilterDto {}

export class IssueAnalysisCardFilterDto extends DashboardFilterDto {}

export class TimeAndMoneySaveCardFilterDto extends DashboardFilterDto {}

export class IssueCardFilterDto extends DashboardFilterDto {
    @IsOptional()
    prUser: string

    @IsOptional()
    @IsIn(['open', 'merged', 'declined'])
    prState: string

    @IsOptional()
    @IsIn(['Major', 'Minor', 'Info', 'Critical', 'Blocker'])
    severity: string

    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    @IsInt()
    @Min(1)
    page?: number = 1

    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    @IsInt()
    @Min(1)
    limit?: number = 10

    @IsOptional()
    @IsMongoId()
    pullRequest: string
}
