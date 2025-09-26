import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'
import * as mongoosePaginate from 'mongoose-paginate-v2'
import * as uniqueValidator from 'mongoose-unique-validator'

export type PullRequestAnalysisCommentDocument = PullRequestAnalysisComment &
    Document

export interface Author {
    username: string
    avatarUrl: string
}

@Schema({ timestamps: true, versionKey: false })
export class PullRequestAnalysisComment {
    @Prop({ required: true, type: String })
    repositorySlug: string

    @Prop({ required: true, type: String, index: true })
    filePath: string

    @Prop({ required: true, type: Number })
    lineStart: number

    @Prop({ type: Number, default: null })
    lineEnd: number

    @Prop({ required: true, type: String })
    content: string

    @Prop({ type: String, default: null })
    codeSnippet?: string

    @Prop({ type: Number, default: null })
    codeSnippetLineStart?: number

    @Prop({
        required: true,
        type: String
    })
    severity: string

    @Prop({ type: Object, default: null })
    metadata?: any

    @Prop({ required: true, type: String, index: true })
    category: string

    @Prop({
        required: false,
        type: Types.ObjectId,
        ref: 'PullRequestAnalysis',
        set: (value) =>
            value instanceof Types.ObjectId
                ? value
                : Types.ObjectId.createFromHexString(value)
    })
    pullRequestAnalysisId?: Types.ObjectId

    @Prop({
        required: false,
        type: Types.ObjectId,
        ref: 'PullRequest',
        set: (value) =>
            value instanceof Types.ObjectId
                ? value
                : Types.ObjectId.createFromHexString(value)
    })
    pullRequest: Types.ObjectId

    @Prop({
        required: false,
        type: Types.ObjectId,
        ref: 'Workspace',
        set: (value) =>
            value instanceof Types.ObjectId
                ? value
                : Types.ObjectId.createFromHexString(value)
    })
    workspace?: Types.ObjectId
}

const schema = SchemaFactory.createForClass(PullRequestAnalysisComment)

schema.plugin(uniqueValidator, {
    message: '{PATH} already exists!'
})
schema.plugin(mongoosePaginate)
export const PullRequestAnalysisCommentSchema = schema
