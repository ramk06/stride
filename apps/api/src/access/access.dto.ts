import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsString, Length, Matches, MaxLength } from 'class-validator';

export class EmailDto {
  @ApiProperty() @Transform(({ value }: { value: unknown }) => typeof value === 'string' ? value.trim().toLowerCase() : value)
  @IsEmail() @MaxLength(254) email!: string;
}
export class LoginDto extends EmailDto {
  @ApiProperty() @IsString() @Length(1, 128) password!: string;
}
export class RegisterDto extends EmailDto {
  @ApiProperty({ minLength: 12, maxLength: 128 }) @IsString() @Length(12, 128) password!: string;
}
export class TokenDto {
  @ApiProperty() @IsString() @Matches(/^[a-f0-9]{64}$/) token!: string;
}
export class RefreshDto {
  @ApiProperty() @IsString() @Matches(/^[a-f0-9]{64}$/) refreshToken!: string;
}
export class ResetDto extends TokenDto {
  @ApiProperty({ minLength: 12 }) @IsString() @Length(12, 128) password!: string;
}
export class PasswordDto {
  @ApiProperty() @IsString() @Length(1, 128) password!: string;
}
export class TokenPair {
  @ApiProperty() accessToken!: string;
  @ApiProperty() refreshToken!: string;
  @ApiProperty() userId!: string;
  @ApiProperty() expiresIn!: number;
}
export class SessionView {
  @ApiProperty() id!: string;
  @ApiProperty() createdAt!: string;
  @ApiProperty() expiresAt!: string;
  @ApiProperty() current!: boolean;
}
