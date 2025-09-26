import { IsBoolean, IsOptional } from 'class-validator'

export class UpdateMemberDto {
    @IsOptional()
    @IsBoolean()
    isActive: boolean
}
