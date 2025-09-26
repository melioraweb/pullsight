import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'
import * as mongoosePaginate from 'mongoose-paginate-v2'
import * as uniqueValidator from 'mongoose-unique-validator'

export type EventLogDocument = EventLog & Document

@Schema({ timestamps: true, versionKey: false })
export class EventLog {
    @Prop({ required: true, trim: true })
    eventName: string

    @Prop({ required: true, trim: true })
    provider: string

    @Prop({ nullable: true, type: Object })
    eventPayload: any
}

const schema = SchemaFactory.createForClass(EventLog)

schema.plugin(uniqueValidator, {
    message: '{PATH} already exists!'
})
schema.plugin(mongoosePaginate)
export const EventLogSchema = schema
