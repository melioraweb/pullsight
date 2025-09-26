import { ValidationPipe, VersioningType } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import * as bodyParser from 'body-parser'
import * as compression from 'compression'
import helmet from 'helmet'
import * as morgan from 'morgan'
import { AppModule } from './app.module'

async function bootstrap() {
    const app = await NestFactory.create(AppModule)

    const options = {
        origin: ['http://localhost:3000'],
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        preflightContinue: false,
        optionsSuccessStatus: 204,
        credentials: true
    }

    // Starts listening for shutdown hooks
    app.enableShutdownHooks()
    app.use(morgan('tiny'))

    // Increase request body size limit (default: 100kb)
    app.use(bodyParser.json({ limit: '10mb' })) // Set the limit as per needs
    app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }))
    app.enableCors(options)
    //app.enableCors()
    app.use(helmet())
    app.use(compression())
    app.enableVersioning({
        type: VersioningType.URI
    })
    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
            whitelist: true
        })
    )

    // Setup graceful shutdown with 10-minute timeout
    const server = await app.listen(process.env.PORT ?? 3000)

    // Set server timeout to 10 minutes (600 seconds)
    server.timeout = 600000 // 10 minutes in milliseconds
    server.keepAliveTimeout = 65000 // Keep alive timeout (recommended to be longer than load balancer timeout)
    server.headersTimeout = 66000 // Headers timeout (should be longer than keepAliveTimeout)    // Graceful shutdown handlers
}
bootstrap()
