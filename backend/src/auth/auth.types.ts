import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterInput {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;
}

export class LoginInput {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;
}

export interface AuthResult {
  accessToken: string;
}
