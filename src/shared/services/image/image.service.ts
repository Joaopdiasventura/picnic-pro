import {
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { join } from "node:path";
import { existsSync, mkdirSync, writeFileSync, unlinkSync } from "node:fs";
import { ProductionImageService } from "../../interfaces/productionImageService";

@Injectable()
export class ImageService {
  private env: string;

  constructor(
    @Inject("ProductionImageService")
    private readonly productionImageService: ProductionImageService,
    private readonly configService: ConfigService,
  ) {
    this.env = this.configService.get("env");
  }

  public async upload(file: Express.Multer.File): Promise<string> {
    this.validateImage(file);

    if (this.env != "DEVELOPMENT")
      return await this.productionImageService.uploadImage(file);

    return await this.uploadLocally(file);
  }

  public async delete(imageUrl: string): Promise<void> {
    if (this.env != "DEVELOPMENT")
      return await this.productionImageService.deleteImage(imageUrl);
    return await this.deleteImageLocally(imageUrl);
  }

  private async uploadLocally(file: Express.Multer.File): Promise<string> {
    const uploadDir = join(__dirname, "..", "..", "..", "..", "uploads");

    if (!existsSync(uploadDir)) mkdirSync(uploadDir, { recursive: true });

    const filePath = join(uploadDir, file.originalname);
    writeFileSync(filePath, file.buffer);

    return `${uploadDir}/${file.originalname}`;
  }

  private async deleteImageLocally(url: string): Promise<void> {
    if (existsSync(url)) return unlinkSync(url);
    throw new NotFoundException("imagem não encontrada");
  }

  private validateImage(file: Express.Multer.File): void {
    const maxSizeInBytes = 200 * 1024 * 1024;
    if (file.size > maxSizeInBytes)
      throw new BadRequestException("Arquivo muito grande");

    const firstBytes = file.buffer.subarray(0, 4);

    const isPNG =
      firstBytes[0] == 0x89 &&
      firstBytes[1] == 0x50 &&
      firstBytes[2] == 0x4e &&
      firstBytes[3] == 0x47;
    const isJPG = firstBytes[0] == 0xff && firstBytes[1] == 0xd8;
    const isJPEG = isJPG;
    const isGIF =
      firstBytes[0] == 0x47 && firstBytes[1] == 0x49 && firstBytes[2] == 0x46;

    if (!(isPNG || isJPG || isJPEG || isGIF))
      throw new BadRequestException("O arquivo não é uma imagem válida");
  }
}
