import { Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs'
import { RegisterDto } from './dto/register.dto';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';


@Injectable()
export class AuthService {
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        private jwtSerive: JwtService
    ) {}
    async register(dto: RegisterDto){
        const existingUser = await this.userModel.findOne({email: dto.email})
        if(existingUser) {
            return { success: false, message: 'Email already exists' };
        }else{
            const hash = await bcrypt.hash(dto.password, 10)
            const user = new this.userModel({
                name: dto.name,
                email: dto.email,
                password: hash,
                location:dto.location,
                role: dto?.role
            })

            const newUser = await user.save()
            console.log("Registering new user...");
            return { success: true, message: 'User registered successfully',id: newUser._id, newUser}
        }
    }

    async login(dto: LoginDto){
        const user = await this.userModel.findOne({ email: dto.email})
        if(!user){
            return { success: false, message: 'Invalid email or password' };
        }

        const verifyPass = await bcrypt.compare(dto.password, user.password)
        if(!verifyPass){
            return { success: false, message: 'Invalid email or password' };
        }
        const payload = { sub: user._id, email: user.email, role:user.role}
        const token = this.jwtSerive.sign(payload)
        return { success: true, message: 'Login successfull', token , user}
    }

    async getAllUsers() {
        const users = await this.userModel.find({ role: "user"}).select('-password')
        return { success: true, message: 'All users fetched!', users}
    }

    async toggleUserVerification(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    user.verifiedUser = !user.verifiedUser;
    await user.save();

    return { success: true, message: `User verification updated to ${user.verifiedUser}`, user };
    }

}
