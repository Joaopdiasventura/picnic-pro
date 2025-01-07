export interface ProductionImageService {
  uploadImage(file: Express.Multer.File): Promise<string>;
  deleteImage(url: string): Promise<void>;
}
