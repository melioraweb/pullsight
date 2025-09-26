import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator'

export class UpdateRepositoryDto {
    @IsOptional()
    @IsBoolean()
    isActive: boolean

    @IsOptional()
    @IsString()
    minSeverity: string

    @IsOptional()
    @IsArray()
    ignore: string[]
}
