import { InjectModel } from "@nestjs/mongoose";
import { CreateUserDto } from "../dto/create-user.dto";
import { UpdateUserDto } from "../dto/update-user.dto";
import { User } from "../entities/user.entity";
import { UserRepository } from "./user.repository";
import { Model } from "mongoose";

export class MongoUserRepository implements UserRepository {
  constructor(@InjectModel("User") private readonly userModel: Model<User>) {}

  public async create(createUserDto: CreateUserDto): Promise<User> {
    return this.userModel.create(createUserDto);
  }
  public async findById(id: string): Promise<User> {
    return this.userModel.findById(id).exec();
  }
  public async findByEmail(email: string): Promise<User> {
    return this.userModel.findOne({ email }).exec();
  }
  public async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    return this.userModel.findByIdAndUpdate(id, updateUserDto);
  }
  public async delete(id: string): Promise<User> {
    return this.userModel.findByIdAndDelete(id);
  }
}
