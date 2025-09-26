import { PartialType } from '@nestjs/mapped-types';
import { CreateGithubDto } from './create-github.dto';

export class UpdateGithubDto extends PartialType(CreateGithubDto) {}
