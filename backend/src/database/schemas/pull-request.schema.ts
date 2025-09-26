import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'
import * as mongoosePaginate from 'mongoose-paginate-v2'
import * as uniqueValidator from 'mongoose-unique-validator'

export type PullRequestDocument = PullRequest & Document

@Schema({ timestamps: false, versionKey: false, id: false })
export class PRFile {
    @Prop({ nullable: true })
    prFileName: string

    @Prop({ nullable: true })
    prFileStatus: string

    @Prop({ default: 0 })
    prFileAdditions: number

    @Prop({ default: 0 })
    prFileDeletions: number

    @Prop({ default: 0 })
    prFileChanges: number

    @Prop({ nullable: true })
    prFileContentBefore: string

    @Prop({ nullable: true })
    prFileContentAfter: string

    @Prop({ nullable: true })
    prFileDiff: string

    @Prop({ type: [String], nullable: true })
    prFileDiffHunks: string[]

    @Prop({ nullable: true })
    prFileBlobUrl: string
}

@Schema({ timestamps: true, versionKey: false })
export class PullRequest {
    @Prop({ required: true })
    provider: string

    @Prop({ required: true })
    prId: string

    @Prop({ required: true })
    prUser: string

    @Prop({ nullable: true })
    prUserAvatar?: string

    @Prop({ required: true })
    owner: string

    @Prop({ required: true })
    repo: string

    @Prop({ required: true })
    prNumber: string

    @Prop({ required: true })
    prUrl: string

    @Prop({ nullable: true })
    installationId: string

    @Prop({ nullable: true })
    prRepoName: string

    @Prop({ nullable: true })
    prTitle: string

    @Prop({ nullable: true })
    prBody: string

    @Prop({ nullable: true })
    prState: string

    @Prop({ nullable: true })
    prCreatedAt: string

    @Prop({ nullable: true })
    prUpdatedAt: string

    @Prop({ nullable: true })
    prClosedAt?: string

    @Prop({ nullable: true })
    prMergedAt?: string

    @Prop({ nullable: true })
    prHeadBranch: string

    @Prop({ nullable: true })
    prBaseBranch: string

    @Prop({ nullable: true })
    prHeadSha: string

    @Prop({ nullable: true })
    prBaseSha: string

    @Prop({ default: 0 })
    prFilesChanged: number

    @Prop({ default: 0 })
    prTotalLineAddition: number

    @Prop({ default: 0 })
    prTotalLineDeletion: number

    @Prop({ type: [PRFile], default: [] })
    prFiles: PRFile[]

    @Prop({ type: Number, default: null })
    issueCount: number

    @Prop({
        type: [{ type: Types.ObjectId, ref: 'PullRequestAnalysis' }]
    })
    pullRequestAnalysis: Types.ObjectId[]
}

const schema = SchemaFactory.createForClass(PullRequest)

schema.plugin(uniqueValidator, {
    message: '{PATH} already exists!'
})
schema.plugin(mongoosePaginate)
export const PullRequestSchema = schema
