import { Test, TestingModule } from "@nestjs/testing";
import { UserController } from "../user.controller";
import { UserService } from "../user.service";
import { CreateUserDto } from "../dto/create-user.dto";
import { LoginUserDto } from "../dto/login-user.dto";
import { UpdateUserDto } from "../dto/update-user.dto";

const mockUserService = {
  create: jest.fn(),
  login: jest.fn(),
  decodeToken: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

describe("UserController", () => {
  let controller: UserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{ provide: UserService, useValue: mockUserService }],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("create", () => {
    it("should create a user", async () => {
      const dto: CreateUserDto = {
        name: "test",
        email: "test@example.com",
        password: "password123",
      };

      const result = {
        message: "Usuário criado com sucesso",
        token: "token",
        user: {
          _id: "1",
          name: "test",
          email: "test@example.com",
        },
      };

      mockUserService.create.mockResolvedValue(result);

      expect(await controller.create(dto)).toBe(result);
      expect(mockUserService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe("login", () => {
    it("should login a user", async () => {
      const dto: LoginUserDto = {
        email: "test@example.com",
        password: "password123",
      };
      const result = {
        message: "Login realizado com sucesso",
        token: "token",
        user: {
          _id: "1",
          name: "test",
          email: "test@example.com",
        },
      };

      mockUserService.login.mockResolvedValue(result);

      expect(await controller.login(dto)).toBe(result);
      expect(mockUserService.login).toHaveBeenCalledWith(dto);
    });
  });

  describe("decodeToken", () => {
    it("should decode a token", async () => {
      const token = "someToken";
      const decodedUser = { id: "1", name: "test", email: "test@example.com" };

      mockUserService.decodeToken.mockResolvedValue(decodedUser);

      expect(await controller.decodeToken(token)).toBe(decodedUser);
      expect(mockUserService.decodeToken).toHaveBeenCalledWith(token);
    });
  });

  describe("update", () => {
    it("should update a user", async () => {
      const id = "1";
      const dto: UpdateUserDto = { name: "test Updated" };
      const result = { message: "Usuário atualizado com sucesso" };

      mockUserService.update.mockResolvedValue(result);

      expect(await controller.update(id, dto)).toBe(result);
      expect(mockUserService.update).toHaveBeenCalledWith(id, dto);
    });
  });

  describe("delete", () => {
    it("should delete a user", async () => {
      const id = "1";
      const result = { message: "Usuário deletado com sucesso" };

      mockUserService.delete.mockResolvedValue(result);

      expect(await controller.delete(id)).toBe(result);
      expect(mockUserService.delete).toHaveBeenCalledWith(id);
    });
  });
});
