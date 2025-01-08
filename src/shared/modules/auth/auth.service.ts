import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { hash, compare } from "bcrypt";

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  public async generateToken(payload: string): Promise<string> {
    return await this.jwtService.signAsync(payload);
  }

  public async decodeToken(token: string): Promise<string> {
    try {
      return String(await this.jwtService.verifyAsync(token));
    } catch {
      throw new BadRequestException("Faça login novamente");
    }
  }

  public async hashPassword(password: string): Promise<string> {
    const saltRounds = this.configService.get<number>("salts");
    return hash(password, saltRounds);
  }

  public async comparePassword(
    password: string,
    hashedPassword: string,
  ): Promise<void> {
    const isValid = await compare(password, hashedPassword);
    if (!isValid) throw new UnauthorizedException("Senha incorreta");
  }
}
