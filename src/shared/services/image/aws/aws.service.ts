import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { ConfigService } from "@nestjs/config";
import { ProductionImageService } from "../../../interfaces/productionImageService";

@Injectable()
export class AwsService implements ProductionImageService {
  private s3Client: S3Client;
  private bucketName: string;

  constructor(private readonly configService: ConfigService) {
    this.s3Client = new S3Client({
      region: this.configService.get("aws.region"),
      credentials: {
        accessKeyId: this.configService.get("aws.accessKeyId"),
        secretAccessKey: this.configService.get("aws.secretAccessKey"),
      },
    });
    this.bucketName = this.configService.get("aws.bucketName");
  }

  async uploadImage(file: Express.Multer.File): Promise<string> {
    const fileKey = `picnic-pro/${Date.now()}-${file.originalname}`;
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: fileKey,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: "public-read",
    });

    try {
      await this.s3Client.send(command);
      const fileUrl = `https://${this.bucketName}.s3.${this.configService.get("aws.region")}.amazonaws.com/${fileKey}`;
      return fileUrl;
    } catch (error) {
      console.error("Error uploading file to S3:", error);
      throw new BadRequestException("Erro ao adicionar a imagem no sistema");
    }
  }

  async deleteImage(url: string): Promise<void> {
    const fileKey = "picnic-pro/" + url.split("/").pop();

    if (!fileKey) throw new Error("URL inválida");

    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: fileKey,
    });

    try {
      await this.s3Client.send(command);
    } catch (error) {
      console.error("Error deleting file from S3:", error);
      throw new NotFoundException("Imagem não encontrada");
    }
  }
}
