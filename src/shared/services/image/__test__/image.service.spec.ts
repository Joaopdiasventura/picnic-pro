import { Test, TestingModule } from "@nestjs/testing";
import { ImageService } from "../image.service";
import { ConfigService } from "@nestjs/config";
import { ProductionImageService } from "../../../interfaces/productionImageService";
import { NotFoundException, BadRequestException } from "@nestjs/common";
import * as fs from "node:fs";
import * as path from "node:path";

jest.mock("node:fs");

describe("ImageService", () => {
  let service: ImageService;
  let productionImageServiceMock: jest.Mocked<ProductionImageService>;
  let configServiceMock: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    productionImageServiceMock = {
      uploadImage: jest.fn(),
      deleteImage: jest.fn(),
    };

    configServiceMock = {
      get: jest.fn().mockReturnValue("DEVELOPMENT"),
    } as unknown as jest.Mocked<ConfigService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImageService,
        {
          provide: "ProductionImageService",
          useValue: productionImageServiceMock,
        },
        { provide: ConfigService, useValue: configServiceMock },
      ],
    }).compile();

    service = module.get<ImageService>(ImageService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("upload", () => {
    const mockFile: Express.Multer.File = {
      originalname: "test.png",
      buffer: Buffer.from([0x89, 0x50, 0x4e, 0x47]),
      size: 1024,
      mimetype: "image/png",
      fieldname: "",
      encoding: "",
      stream: null,
      destination: "",
      filename: "",
      path: "",
    };

    it("should upload locally in DEVELOPMENT environment", async () => {
      const uploadDir = path.join(
        __dirname,
        "..",
        "..",
        "..",
        "..",
        "..",
        "uploads",
      );
      const expectedPath = path.join(uploadDir, mockFile.originalname);

      const normalizedExpectedPath = path.normalize(expectedPath);

      jest.spyOn(fs, "existsSync").mockReturnValue(false);
      jest.spyOn(fs, "mkdirSync").mockImplementation();
      jest.spyOn(fs, "writeFileSync").mockImplementation();

      const result = await service.upload(mockFile);

      const normalizedResult = path.normalize(result);

      expect(normalizedResult).toEqual(normalizedExpectedPath);
      expect(fs.mkdirSync).toHaveBeenCalledWith(uploadDir, { recursive: true });
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        path.join(uploadDir, mockFile.originalname),
        mockFile.buffer,
      );
    });

    it("should use productionImageService in non-DEVELOPMENT environment", async () => {
      const mockFile = {
        buffer: Buffer.from([137, 80, 78, 71]),
        mimetype: "image/png",
        originalname: "test.png",
        size: 1024,
        fieldname: "file",
        encoding: "7bit",
        destination: "",
        filename: "test.png",
        path: "",
        stream: null,
      };

      const productionImageServiceMock = {
        uploadImage: jest.fn().mockResolvedValue("uploaded-url"),
        deleteImage: jest.fn(),
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          ImageService,
          {
            provide: "ProductionImageService",
            useValue: productionImageServiceMock,
          },
          ConfigService,
        ],
      }).compile();

      const service = module.get<ImageService>(ImageService);

      jest.spyOn(service["configService"], "get").mockReturnValue("PRODUCTION");

      const result = await service.upload(mockFile);

      expect(productionImageServiceMock.uploadImage).toHaveBeenCalledWith(
        mockFile,
      );
      expect(result).toEqual("uploaded-url");
    });

    it("should throw an error if file is too large", async () => {
      const largeFile = { ...mockFile, size: 300 * 1024 * 1024 };

      await expect(service.upload(largeFile)).rejects.toThrow(
        BadRequestException,
      );
    });

    it("should throw an error if file is not a valid image", async () => {
      const invalidFile = {
        ...mockFile,
        buffer: Buffer.from([0x00, 0x00, 0x00, 0x00]),
      };

      await expect(service.upload(invalidFile)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe("delete", () => {
    it("should delete locally in DEVELOPMENT environment", async () => {
      const imageUrl = "test-path";
      jest.spyOn(fs, "existsSync").mockReturnValue(true);
      jest.spyOn(fs, "unlinkSync").mockImplementation();

      await service.delete(imageUrl);

      expect(fs.existsSync).toHaveBeenCalledWith(imageUrl);
      expect(fs.unlinkSync).toHaveBeenCalledWith(imageUrl);
    });

    it("should throw an error if image does not exist locally", async () => {
      const imageUrl = "test-path";
      jest.spyOn(fs, "existsSync").mockReturnValue(false);

      await expect(service.delete(imageUrl)).rejects.toThrow(NotFoundException);
    });

    it("should use productionImageService in non-DEVELOPMENT environment", async () => {
      const imageUrl = "some/path/to/image.png";

      const productionImageServiceMock = {
        uploadImage: jest.fn().mockResolvedValue("uploaded-url"),
        deleteImage: jest.fn().mockResolvedValue(undefined),
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          ImageService,
          {
            provide: "ProductionImageService",
            useValue: productionImageServiceMock,
          },
          ConfigService,
        ],
      }).compile();

      const service = module.get<ImageService>(ImageService);

      jest.spyOn(service["configService"], "get").mockReturnValue("PRODUCTION");

      jest.spyOn(fs, "existsSync").mockReturnValue(true);

      jest.spyOn(fs, "unlinkSync").mockImplementation(() => {});

      await service.delete(imageUrl);

      expect(productionImageServiceMock.deleteImage).toHaveBeenCalledWith(
        imageUrl,
      );
    });
  });
});
