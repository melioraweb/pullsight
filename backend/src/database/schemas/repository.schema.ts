import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'
import * as mongoosePaginate from 'mongoose-paginate-v2'
import * as uniqueValidator from 'mongoose-unique-validator'
import { Severity } from 'src/common/enums/pr.enum'

export type RepositoryDocument = Repository & Document

export interface Author {
    username: string
    avatarUrl: string
}

@Schema({ timestamps: true, versionKey: false })
export class Repository {
    @Prop({ required: true, trim: true })
    id: string

    @Prop({ required: true, trim: true })
    name: string

    @Prop({ required: true, trim: true })
    fullName: string

    @Prop({ required: false, trim: true })
    slug: string

    @Prop({ required: false, nullable: true })
    webhookToken: string

    @Prop({ required: true, trim: true })
    provider: string

    @Prop({ required: false, trim: true })
    url: string

    @Prop({ required: false })
    private?: boolean

    @Prop({ required: false })
    createdOn?: string

    @Prop({ required: false })
    updatedOn?: string

    @Prop({ required: false, type: Object })
    author: Author

    @Prop({ required: true, default: true })
    isActive: boolean

    @Prop({ required: false, default: [] })
    ignore: string[]

    @Prop({ default: Severity.MAJOR })
    minSeverity: string

    @Prop({
        required: true,
        type: Types.ObjectId,
        ref: 'Workspace',
        set: (value) =>
            value instanceof Types.ObjectId
                ? value
                : Types.ObjectId.createFromHexString(value)
    })
    workspace?: Types.ObjectId
}

const schema = SchemaFactory.createForClass(Repository)

schema.plugin(uniqueValidator, {
    message: '{PATH} already exists!'
})
schema.plugin(mongoosePaginate)
export const RepositorySchema = schema
