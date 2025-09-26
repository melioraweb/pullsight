import { PartialType } from '@nestjs/mapped-types';
import { CreateBitbucketDto } from './create-bitbucket.dto';

export class UpdateBitbucketDto extends PartialType(CreateBitbucketDto) {}
