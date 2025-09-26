import {
    IsBoolean,
    IsEnum,
    IsInt,
    IsOptional,
    IsString,
    Min
} from 'class-validator'
import { ClaudeModelEnum } from 'src/database/schemas/workspace.schema'

export class CreateAndUpdateWorkspaceSettingsDto {
    @IsOptional()
    @IsString()
    apiKey?: string

    @IsOptional()
    @IsEnum(ClaudeModelEnum)
    model?: ClaudeModelEnum

    @IsOptional()
    @IsInt()
    @Min(0)
    hourlyRate?: number

    @IsOptional()
    @IsBoolean()
    usingOwnModel?: boolean
}
