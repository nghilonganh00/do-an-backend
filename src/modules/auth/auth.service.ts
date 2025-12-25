import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { SupabaseService } from '../supabase/supabase.service';
import { RegisterDto } from './dtos/register.dto';
import { User } from '../user/user.entity';
import { LoginDto } from './dtos/log.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register({ email, password }: RegisterDto) {
    const hashedPassword = await bcrypt.hash(password, 10);

    const { data, error } = await this.supabaseService.client
      .from('users')
      .insert({
        email: email,
        password: hashedPassword,
        name: 'New User',
      })
      .select('id, email, created_at')
      .single<User>();

    if (error) {
      if (error.code === '23505')
        throw new BadRequestException('Email already exists');
      throw new InternalServerErrorException(error.message);
    }

    return { message: 'User registered successfully', data };
  }

  async login(loginDto: LoginDto) {
    const { data: user, error } = await this.supabaseService.client
      .from('users')
      .select('*, userRoles(*)')
      .eq('email', loginDto.email)
      .single<User>();

    if (error || !user) {
      throw new UnauthorizedException('Email or password is incorrect');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email or password is incorrect');
    }

    console.log('user: ', user);

    const payload = {
      sub: user.id,
      email: user.email,
      roles: user?.userRoles.flatMap((userRole) => userRole.role),
    };

    console.log('payload: ', payload);

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
        expiresIn: '12h',
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: '7d',
      }),
    ]);

    const hashedRT = await bcrypt.hash(refreshToken, 10);
    const { error: updateError } = await this.supabaseService.client
      .from('users')
      .update({ refreshToken: hashedRT })
      .eq('id', user.id);

    if (updateError)
      throw new InternalServerErrorException('Could not save session');

    return {
      message: 'Login successful',
      data: {
        accessToken,
        refreshToken,
        user: user,
      },
    };
  }
}
