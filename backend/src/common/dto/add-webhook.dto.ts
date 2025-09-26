import { IsNotEmpty, IsString } from 'class-validator'

export class AddWebhookDto {
    @IsNotEmpty()
    @IsString()
    repo: string
}
