import { IsArray, IsOptional, IsString } from 'class-validator';

export class UpdateSettingsDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  visibleColumns?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  visibleFilters?: string[];
}
