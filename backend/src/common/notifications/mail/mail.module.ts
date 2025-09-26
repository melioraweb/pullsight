import { MailerModule } from '@nestjs-modules/mailer'
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter'
import { Global, Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import * as path from 'path'

@Global()
@Module({
    imports: [
        ConfigModule.forRoot(),
        MailerModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                transport: {
                    host: configService.get<string>('MAIL_HOST'),
                    port: configService.get<number>('MAIL_PORT'), // Office 365 SMTP port
                    secure: true, // Use TLS (set to true if using port 465)
                    auth: {
                        user: configService.get<string>('MAIL_USERNAME'),
                        pass: configService.get<string>('MAIL_PASSWORD')
                    }
                },
                defaults: {
                    from: `${configService.get<string>('MAIL_FROM_NAME')} <${configService.get<string>('MAIL_FROM_ADDRESS')}>`
                },
                template: {
                    dir: path.join(__dirname, 'templates'),
                    adapter: new HandlebarsAdapter(),
                    options: {
                        strict: true
                    }
                }
            })
        })
    ]
    // providers: [MailService],
    // exports: [MailService]
})
export class MailModule {}
