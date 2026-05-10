import { Type } from "class-transformer";
import { IsArray, IsDateString, IsInt, IsNumber, IsOptional, IsString, Min, ValidateNested } from "class-validator";

export class HealthMetricItemDto {
  @IsDateString()
  capturedAt!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  steps?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  activeMinutes?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  sleepMinutes?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  restingHeartRate?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  hrv?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  bloodOxygen?: number;
}

export class IngestHealthMetricsDto {
  @IsString()
  studentId!: string;

  @IsString()
  sourceApp!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HealthMetricItemDto)
  metrics!: HealthMetricItemDto[];
}
