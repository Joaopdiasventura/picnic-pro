import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UserRepository } from './repositories/user.repository';
import { AuthService } from '../../shared/modules/auth/auth.service';
import { AuthMessage } from '../../shared/interfaces/authMessage';
import { Message } from '../../shared/interfaces/message';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @Inject('UserRepository') private readonly userRepository: UserRepository,
    private readonly authService: AuthService,
  ) {}

  public async create(createUserDto: CreateUserDto): Promise<AuthMessage> {
    await this.throwIfEmailIsUsed(createUserDto.email);

    createUserDto.password = await this.authService.hashPassword(
      createUserDto.password,
    );

    const user = await this.userRepository.create(createUserDto);

    const userObject = user.toObject();
    delete userObject.password;

    const token = await this.authService.generateToken(user.id);

    return { message: 'Usuário criado com sucesso', token, user: userObject };
  }

  public async login(loginUserDto: LoginUserDto): Promise<AuthMessage> {
    const user = await this.findByEmail(loginUserDto.email);

    await this.authService.comparePassword(
      loginUserDto.password,
      user.password,
    );

    const userObject = user.toObject();
    delete userObject.password;

    const token = await this.authService.generateToken(user.id);

    return { message: 'Login realizado com sucesso', token, user: userObject };
  }

  public async decodeToken(token: string): Promise<User> {
    const id = await this.authService.decodeToken(token);
    const user = await this.findById(id);

    const userObject = user.toObject();
    delete userObject.password;

    return userObject;
  }

  public async findById(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) throw new NotFoundException('Usuário não encontrado');
    return user;
  }

  public async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<Message> {
    const { email } = await this.findById(id);

    if (updateUserDto.email && updateUserDto.email != email)
      await this.throwIfEmailIsUsed(updateUserDto.email);

    if (updateUserDto.password)
      updateUserDto.password = await this.authService.hashPassword(
        updateUserDto.password,
      );

    await this.userRepository.update(id, updateUserDto);
    return { message: 'Usuário atualizado com sucesso' };
  }

  public async delete(id: string): Promise<Message> {
    await this.findById(id);
    await this.userRepository.delete(id);
    return { message: 'Usuário atualizado com sucesso' };
  }

  private async findByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) throw new NotFoundException('Usuário não encontrado');
    return user;
  }

  private async throwIfEmailIsUsed(email: string): Promise<void> {
    const user = await this.userRepository.findByEmail(email);
    if (user)
      throw new BadRequestException('Esse email já está sendo utilizado');
  }
}
