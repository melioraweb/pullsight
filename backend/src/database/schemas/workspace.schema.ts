import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'
import * as mongoosePaginate from 'mongoose-paginate-v2'
import * as uniqueValidator from 'mongoose-unique-validator'

export type WorkspaceDocument = Workspace & Document

// Enum for Claude model families
export enum ClaudeModelEnum {
    CLAUDE_4_1_OPUS = 'claude-opus-4-1-20250805',
    CLAUDE_4_OPUS = 'claude-opus-4-20250514',
    CLAUDE_4_SONNET = 'claude-sonnet-4-20250514',
    CLAUDE_3_7_SONNET = 'claude-3-7-sonnet-20250219',
    CLAUDE_3_5_HAIKU = 'claude-3-5-haiku-20241022'
}

@Schema({ timestamps: false, versionKey: false, id: false })
export class workspaceSetting {
    @Prop({
        required: false,
        trim: true
    })
    apiKey?: string

    @Prop({
        type: String,
        enum: Object.values(ClaudeModelEnum),
        default: ClaudeModelEnum.CLAUDE_4_1_OPUS
    })
    model?: ClaudeModelEnum

    @Prop({
        type: Number,
        default: 50,
        min: 0
    })
    hourlyRate?: number

    @Prop({
        type: Boolean,
        default: false
    })
    usingOwnModel?: boolean

    @Prop({
        type: String,
        required: false,
        description: 'Custom API endpoint URL (if using own model)'
    })
    customApiEndpoint?: string

    @Prop({
        type: Number,
        default: 1000,
        min: 1,
        description: 'Maximum tokens per request'
    })
    maxTokens?: number

    @Prop({
        type: Number,
        default: 0.7,
        min: 0,
        max: 2,
        description: 'Temperature for AI model responses (0-2)'
    })
    temperature?: number
}

@Schema({ timestamps: true, versionKey: false })
export class Workspace {
    @Prop({ required: true, trim: true })
    id: string

    @Prop({ required: true, trim: true })
    name: string

    @Prop({ required: true, trim: true })
    slug: string

    @Prop({ required: true, trim: true })
    provider: string

    @Prop({ required: true, trim: true })
    url: string

    @Prop({ required: true, trim: true })
    reposUrl: string

    @Prop({ required: false })
    avatarUrl: string

    @Prop({ required: true, trim: true })
    type?: string

    @Prop({ required: true, trim: true })
    nodeId: string

    @Prop({ required: false })
    description?: string

    @Prop({ required: false, trim: true })
    installationId?: string

    @Prop({ required: false })
    isPrivate?: boolean

    @Prop({ required: false })
    createdOn?: string

    @Prop({ required: false, default: 1 })
    onboardingStep?: number

    @Prop({
        required: true,
        type: Types.ObjectId,
        ref: 'User',
        set: (value) =>
            value instanceof Types.ObjectId
                ? value
                : Types.ObjectId.createFromHexString(value)
    })
    ownerId?: Types.ObjectId

    @Prop({
        required: false,
        type: Types.ObjectId,
        ref: 'Team',
        set: (value) =>
            value instanceof Types.ObjectId
                ? value
                : Types.ObjectId.createFromHexString(value)
    })
    team?: Types.ObjectId

    @Prop({ type: workspaceSetting, nullable: true })
    workspaceSetting?: workspaceSetting

    @Prop({ required: false, default: 0 })
    noOfActiveMembers?: number
}

const schema = SchemaFactory.createForClass(Workspace)

schema.plugin(uniqueValidator, {
    message: '{PATH} already exists!'
})
schema.plugin(mongoosePaginate)
export const WorkspaceSchema = schema
