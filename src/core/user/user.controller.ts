import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  Param,
  Delete,
  HttpCode,
} from "@nestjs/common";
import { UserService } from "./user.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { LoginUserDto } from "./dto/login-user.dto";
import { ParseObjectIdPipe } from "../../shared/pipes/parse-object-id.pipe";
import { User } from "./entities/user.entity";
import { AuthMessage } from "../../shared/interfaces/authMessage";
import { Message } from "../../shared/interfaces/message";

@Controller("user")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  public create(@Body() createUserDto: CreateUserDto): Promise<AuthMessage> {
    return this.userService.create(createUserDto);
  }

  @HttpCode(200)
  @Post("login")
  public login(@Body() loginUserDto: LoginUserDto): Promise<AuthMessage> {
    return this.userService.login(loginUserDto);
  }

  @Get("decodeToken/:token")
  public decodeToken(@Param("token") token: string): Promise<User> {
    return this.userService.decodeToken(token);
  }

  @Patch(":id")
  public update(
    @Param("id", ParseObjectIdPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<Message> {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(":id")
  public delete(@Param("id", ParseObjectIdPipe) id: string): Promise<Message> {
    return this.userService.delete(id);
  }
}
