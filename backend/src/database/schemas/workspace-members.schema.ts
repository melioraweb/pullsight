import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'
import * as mongoosePaginate from 'mongoose-paginate-v2'
import * as uniqueValidator from 'mongoose-unique-validator'

export type WorkspaceMemberDocument = WorkspaceMember & Document

export enum MemberRole {
    OWNER = 'owner',
    MEMBER = 'member'
    // VIEWER = 'viewer',
    // ADMIN = 'admin'
}

@Schema({ timestamps: true, versionKey: false })
export class WorkspaceMember {
    @Prop({ required: true, trim: true })
    provider: string

    @Prop({ required: true, trim: true })
    providerId: string

    @Prop({ required: false, trim: true })
    username: string

    @Prop({
        required: true,
        type: Types.ObjectId,
        ref: 'Workspace',
        set: (value) =>
            value instanceof Types.ObjectId
                ? value
                : Types.ObjectId.createFromHexString(value)
    })
    workspace: Types.ObjectId

    @Prop({
        required: false,
        nullable: true,
        type: Types.ObjectId,
        ref: 'User'
    })
    user: Types.ObjectId

    @Prop({
        required: true,
        enum: Object.values(MemberRole),
        default: MemberRole.MEMBER
    })
    role: MemberRole

    @Prop({ required: false, default: null })
    invitedAt?: Date

    @Prop({ required: false, default: null })
    joinedAt?: Date

    @Prop({ required: true, default: true })
    isActive: boolean
}

const schema = SchemaFactory.createForClass(WorkspaceMember)

schema.plugin(uniqueValidator, {
    message: '{PATH} already exists!'
})
schema.plugin(mongoosePaginate)
export const WorkspaceMemberSchema = schema
