import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";

export type UserDocument = User & Document;

@Schema()
export class User {
    @Prop({ required: true})
    name: string;

    @Prop({required: true, unique: true})
    email: string;

    @Prop({required: true})
    password: string;

    @Prop({ required: true})
    location: string;

    @Prop({ default: "user", enum:['user', 'admin']})
    role: string

    @Prop({ default: false})
    verifiedUser: boolean
}

export const UserSchema = SchemaFactory.createForClass(User)