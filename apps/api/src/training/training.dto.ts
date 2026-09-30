import { ApiProperty, ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsDateString, IsIn, IsInt, IsOptional, IsString, IsTimeZone, IsUUID, Length, Matches, Max, MaxLength, Min } from 'class-validator';

export class VersionDto {
  @ApiProperty() @IsInt() @Min(1) expectedVersion!: number;
}
export class ActivityInput {
  @ApiProperty() @IsUUID() id!: string;
  @ApiProperty() @IsString() @Length(1, 120) title!: string;
  @ApiProperty({ enum: ['run', 'trail', 'walk'] }) @IsIn(['run', 'trail', 'walk']) sport!: string;
  @ApiProperty() @IsDateString({ strict: true }) @Matches(/T.*(Z|[+-]\d{2}:\d{2})$/) startedAt!: string;
  @ApiProperty() @IsTimeZone() timezone!: string;
  @ApiProperty() @IsInt() @Min(0) @Max(1000000) distanceMeters!: number;
  @ApiProperty() @IsInt() @Min(1) @Max(604800) movingSeconds!: number;
  @ApiProperty() @IsInt() @Min(1) @Max(604800) elapsedSeconds!: number;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(2000) notes?: string;
  @ApiPropertyOptional({ type: String, nullable: true }) @IsOptional() @IsUUID() gearId?: string | null;
}
export class ActivityPatch extends PartialType(OmitType(ActivityInput, ['id'] as const), { skipNullProperties: false }) {
  @ApiProperty() @IsInt() @Min(1) expectedVersion!: number;
}
export class ActivityQuery {
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(512) cursor?: string;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(50) limit = 20;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(100) search?: string;
  @ApiPropertyOptional({ enum: ['run', 'trail', 'walk'] }) @IsOptional() @IsIn(['run', 'trail', 'walk']) sport?: string;
}
export class GearInput {
  @ApiProperty() @IsUUID() id!: string;
  @ApiProperty() @IsString() @Length(1, 100) name!: string;
  @ApiProperty({ enum: ['shoe', 'equipment'] }) @IsIn(['shoe', 'equipment']) type!: string;
  @ApiProperty() @IsString() @MaxLength(100) brand!: string;
  @ApiProperty() @IsInt() @Min(0) @Max(100000000) openingMileageMeters!: number;
  @ApiPropertyOptional({ type: Number, nullable: true }) @IsOptional() @IsInt() @Min(1) @Max(100000000) expectedLifeMeters?: number | null;
}
export class GearPatch extends PartialType(OmitType(GearInput, ['id'] as const), { skipNullProperties: false }) {
  @ApiProperty() @IsInt() @Min(1) expectedVersion!: number;
  @ApiPropertyOptional({ type: String, nullable: true }) @IsOptional() @IsDateString() retiredAt?: string | null;
}
export class GoalInput {
  @ApiProperty() @IsUUID() id!: string;
  @ApiProperty() @IsString() @Length(1, 120) title!: string;
  @ApiProperty({ enum: ['distance', 'count', 'longest'] }) @IsIn(['distance', 'count', 'longest']) type!: string;
  @ApiProperty() @IsInt() @Min(1) @Max(100000000) target!: number;
  @ApiProperty({ enum: ['week', 'month', 'custom'] }) @IsIn(['week', 'month', 'custom']) period!: string;
  @ApiProperty() @IsTimeZone() timezone!: string;
  @ApiProperty() @Matches(/^\d{4}-\d{2}-\d{2}$/) startsOn!: string;
  @ApiProperty() @Matches(/^\d{4}-\d{2}-\d{2}$/) endsOn!: string;
}
export class GoalPatch extends PartialType(OmitType(GoalInput, ['id'] as const), { skipNullProperties: false }) {
  @ApiProperty() @IsInt() @Min(1) expectedVersion!: number;
  @ApiPropertyOptional({ type: String, nullable: true }) @IsOptional() @IsDateString() archivedAt?: string | null;
}
export class ProfileInput {
  @ApiProperty() @IsString() @Length(1, 80) displayName!: string;
  @ApiProperty({ enum: ['km', 'mi'] }) @IsIn(['km', 'mi']) units!: string;
  @ApiProperty() @IsTimeZone() timezone!: string;
  @ApiProperty({ enum: ['beginner', 'regular', 'experienced'] }) @IsIn(['beginner', 'regular', 'experienced']) experience!: string;
  @ApiProperty() @IsBoolean() notifications!: boolean;
  @ApiProperty() @IsInt() @Min(1) expectedVersion!: number;
}
export class ActivityView extends ActivityInput {
  @ApiProperty() version!: number;
  @ApiProperty() source!: string;
  @ApiProperty() routeAvailable!: boolean;
  @ApiProperty() splitsAvailable!: boolean;
}
export class ActivityPage {
  @ApiProperty({ type: [ActivityView] }) items!: ActivityView[];
  @ApiProperty({ type: String, nullable: true }) nextCursor!: string | null;
}
export class GearView extends GearInput {
  @ApiProperty() version!: number;
  @ApiProperty() usageMeters!: number;
  @ApiProperty({ type: String, nullable: true }) retiredAt!: string | null;
}
export class GoalView extends GoalInput {
  @ApiProperty() version!: number;
  @ApiProperty() progress!: number;
  @ApiProperty() asOf!: string;
  @ApiProperty() periodStart!: string;
  @ApiProperty() periodEnd!: string;
  @ApiProperty({ type: String, nullable: true }) archivedAt!: string | null;
}
export class ProfileView {
  @ApiProperty() displayName!: string;
  @ApiProperty() units!: string;
  @ApiProperty() timezone!: string;
  @ApiProperty() experience!: string;
  @ApiProperty() notifications!: boolean;
  @ApiProperty() version!: number;
}
export class DashboardView {
  @ApiProperty() distanceMeters!: number;
  @ApiProperty() movingSeconds!: number;
  @ApiProperty() activityCount!: number;
  @ApiProperty() periodStart!: string;
  @ApiProperty() periodEnd!: string;
  @ApiProperty() asOf!: string;
  @ApiProperty({ type: ProfileView }) profile!: ProfileView;
  @ApiProperty({ type: ActivityView, nullable: true }) latest!: ActivityView | null;
}

export class CollectionQuery {
  @ApiPropertyOptional() @IsOptional() @IsUUID() cursor?: string;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(50) limit = 20;
  @ApiPropertyOptional({ enum: ['active', 'archived', 'all'] }) @IsOptional() @IsIn(['active', 'archived', 'all']) status = 'active';
}
export class GearPage {
  @ApiProperty({ type: [GearView] }) items!: GearView[];
  @ApiProperty({ type: String, nullable: true }) nextCursor!: string | null;
}
export class GoalPage {
  @ApiProperty({ type: [GoalView] }) items!: GoalView[];
  @ApiProperty({ type: String, nullable: true }) nextCursor!: string | null;
}