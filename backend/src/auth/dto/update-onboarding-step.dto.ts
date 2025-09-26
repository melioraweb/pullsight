import { IsInt, IsOptional, IsString } from 'class-validator'

export class UpdateOnboardingStepDto {
    @IsString()
    @IsOptional()
    currentWorkspace?: string | null
}
