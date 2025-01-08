import { Module } from '@nestjs/common';
import { ImageService } from './image.service';
import { AwsService } from './aws/aws.service';

@Module({
  providers: [
    ImageService,
    { provide: 'ProductionImageService', useClass: AwsService },
  ],
  exports: [ImageService],
})
export class ImageModule {}
