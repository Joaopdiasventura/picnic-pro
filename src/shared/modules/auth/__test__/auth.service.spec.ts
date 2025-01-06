import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
            verifyAsync: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateToken', () => {
    it('should generate a token successfully', async () => {
      jest.spyOn(jwtService, 'signAsync').mockResolvedValue('token');
      const token = await service.generateToken('payload');
      expect(token).toBe('token');
      expect(jwtService.signAsync).toHaveBeenCalledWith('payload');
    });
  });

  describe('decodeToken', () => {
    it('should decode a token successfully', async () => {
      jest.spyOn(jwtService, 'verifyAsync').mockImplementation(() => 'userId' as any);
      const payload = await service.decodeToken('token');
      expect(payload).toBe('userId');

      expect(jwtService.verifyAsync).toHaveBeenCalledWith('token');
    });

    it('should throw BadRequestException if token is invalid', async () => {
      jest
        .spyOn(jwtService, 'verifyAsync')
        .mockRejectedValue(new Error('Invalid token'));
      await expect(service.decodeToken('token')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('hashPassword', () => {
    it('should hash the password successfully', async () => {
      jest.spyOn(configService, 'get').mockReturnValue(10);
      jest
        .spyOn(bcrypt, 'hash')
        .mockImplementation(async () => 'hashedPassword');
      const hashedPassword = await service.hashPassword('password');
      expect(hashedPassword).toBe('hashedPassword');
      expect(configService.get).toHaveBeenCalledWith('salts');
      expect(bcrypt.hash).toHaveBeenCalledWith('password', 10);
    });
  });

  describe('comparePassword', () => {
    it('should validate password successfully', async () => {
      jest.spyOn(bcrypt, 'compare').mockImplementation(async () => true);
      await expect(
        service.comparePassword('password', 'hashedPassword'),
      ).resolves.toBeUndefined();
      expect(bcrypt.compare).toHaveBeenCalledWith('password', 'hashedPassword');
    });

    it('should throw UnauthorizedException if password is incorrect', async () => {
      jest.spyOn(bcrypt, 'compare').mockImplementation(async () => false);
      await expect(
        service.comparePassword('password', 'hashedPassword'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
