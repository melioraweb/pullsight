import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'
import * as mongoosePaginate from 'mongoose-paginate-v2'
import * as uniqueValidator from 'mongoose-unique-validator'

export type PullRequestAnalysisDocument = PullRequestAnalysis & Document

export interface Author {
    username: string
    avatarUrl: string
}
export enum Status {
    INPROGRESS = 'inprogress',
    COMPLETED = 'completed',
    FAILED = 'failed'
}
@Schema({ timestamps: true, versionKey: false })
export class PullRequestAnalysis {
    @Prop({ required: true, type: String })
    prId: string

    @Prop({ required: true, type: String })
    provider: string

    @Prop({ required: true, type: String })
    workspaceSlug: string

    @Prop({ required: true, type: String })
    repositorySlug: string

    @Prop({ required: true, type: String })
    prNumber: string

    @Prop({ nullable: true })
    installationId: string

    @Prop({ type: String, default: null })
    summary: string

    @Prop({ type: Object, default: null })
    modelInfo: any

    @Prop({ type: Object, default: null })
    usageInfo: any

    @Prop({ type: Object, default: null })
    prReviewModelInfo: any

    @Prop({ type: Object, default: null })
    prReviewUsageInfo: any

    @Prop({ type: String, enum: Status, default: Status.INPROGRESS })
    status: Status

    @Prop({ type: String })
    prState: string

    @Prop({ type: Date, default: null })
    startedAt: Date

    @Prop({ type: Date, default: null })
    completedAt: Date

    @Prop({
        required: true,
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

    @Prop({ type: Number, default: 0 })
    estimatedCodeReviewEffort: number

    @Prop({ type: Number, default: 0 })
    potentialIssueCount: number
}

const schema = SchemaFactory.createForClass(PullRequestAnalysis)

schema.plugin(uniqueValidator, {
    message: '{PATH} already exists!'
})
schema.plugin(mongoosePaginate)
export const PullRequestAnalysisSchema = schema
