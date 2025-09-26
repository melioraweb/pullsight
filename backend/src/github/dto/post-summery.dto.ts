import { IsNotEmpty, IsNumber, IsString } from 'class-validator'

export class PostSummeryDto {
    @IsString()
    @IsNotEmpty()
    owner: string

    @IsString()
    @IsNotEmpty()
    repo: string

    @IsNumber()
    @IsNotEmpty()
    prNumber: number

    @IsString()
    body: string

    @IsNumber()
    @IsNotEmpty()
    installationId: number
}
