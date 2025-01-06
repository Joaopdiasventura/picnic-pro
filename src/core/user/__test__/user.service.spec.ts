import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../user.service';
import { AuthService } from '../../../shared/modules/auth/auth.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import { LoginUserDto } from '../dto/login-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';

const mockUserRepository = {
  create: jest.fn(),
  findById: jest.fn(),
  findByEmail: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

const mockAuthService = {
  hashPassword: jest.fn(),
  comparePassword: jest.fn(),
  generateToken: jest.fn(),
  decodeToken: jest.fn(),
};

describe('UserService', () => {
  let service: UserService;
  let userRepository: typeof mockUserRepository;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: 'UserRepository', useValue: mockUserRepository },
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get('UserRepository');
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a user successfully', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        name: 'test',
        password: 'password123',
      };

      const user = {
        id: '1',
        email: 'test@example.com',
        name: 'test',
        password: 'password123',
        isManager: false,
        toObject: jest.fn(() => ({
          _id: '1',
          email: 'test@example.com',
          name: 'test',
          isManager: false,
        })),
      };

      jest.spyOn(userRepository, 'findByEmail').mockResolvedValue(null);
      jest
        .spyOn(authService, 'hashPassword')
        .mockResolvedValue('hashedPassword');
      jest.spyOn(userRepository, 'create').mockResolvedValue(user);
      jest.spyOn(authService, 'generateToken').mockResolvedValue('token');

      const result = await service.create(createUserDto);

      expect(result).toEqual({
        message: 'Usuário criado com sucesso',
        token: 'token',
        user: {
          _id: '1',
          email: 'test@example.com',
          name: 'test',
          isManager: false,
        },
      });
    });

    it('should throw if email is already in use', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        name: 'test',
        password: 'password123',
      };

      jest.spyOn(userRepository, 'findByEmail').mockResolvedValue({});

      await expect(service.create(createUserDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('login', () => {
    it('should login successfully', async () => {
      const loginUserDto: LoginUserDto = {
        email: 'test@example.com',
        password: 'password123',
      };
      const user = {
        id: '1',
        email: 'test@example.com',
        password: 'hashedPassword',
        isManager: false,
        toObject: jest.fn(() => ({
          _id: '1',
          email: 'test@example.com',
          name: 'test',
          isManager: false,
        })),
      };

      jest.spyOn(userRepository, 'findByEmail').mockResolvedValue(user);
      jest.spyOn(authService, 'comparePassword').mockResolvedValue();
      jest.spyOn(authService, 'generateToken').mockResolvedValue('token');

      const result = await service.login(loginUserDto);

      expect(result).toEqual({
        message: 'Login realizado com sucesso',
        token: 'token',
        user: {
          _id: '1',
          email: 'test@example.com',
          name: 'test',
          isManager: false,
        },
      });
    });

    it('should throw if user is not found', async () => {
      const loginUserDto: LoginUserDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      jest.spyOn(userRepository, 'findByEmail').mockResolvedValue(null);

      await expect(service.login(loginUserDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a user successfully', async () => {
      const id = '1';
      const updateUserDto: UpdateUserDto = {
        email: 'new@example.com',
        password: 'newPassword',
      };
      const user = {
        id: '1',
        email: 'old@example.com',
        password: 'hashedPassword',
      };

      jest.spyOn(userRepository, 'findById').mockResolvedValue(user);
      jest
        .spyOn(authService, 'hashPassword')
        .mockResolvedValue('newHashedPassword');
      jest.spyOn(userRepository, 'update').mockResolvedValue(null);

      const result = await service.update(id, updateUserDto);

      expect(result).toEqual({ message: 'Usuário atualizado com sucesso' });
    });
  });

  describe('delete', () => {
    it('should delete a user successfully', async () => {
      const id = '1';
      const user = { id: '1', email: 'test@example.com' };

      jest.spyOn(userRepository, 'findById').mockResolvedValue(user);

      const result = await service.delete(id);

      expect(result).toEqual({ message: 'Usuário atualizado com sucesso' });
    });

    it('should throw if user is not found', async () => {
      const id = '1';

      jest.spyOn(userRepository, 'findById').mockResolvedValue(null);

      await expect(service.delete(id)).rejects.toThrow(NotFoundException);
    });
  });
});
