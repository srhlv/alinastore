import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AdminUser } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { PrismaService } from '../prisma/prisma.service';

export type JwtPayload = {
  sub:      string;
  username: string;
};

@Injectable()
export class AdminAuthService {
  constructor( private readonly prisma: PrismaService ) {}

  async validateUser(
    username: string,
    password: string,
  ): Promise<AdminUser | null> {
    const user = await this.prisma.adminUser.findUnique( {
      where: { username },
    } );

    if ( !user ) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare( password, user.password );

    if ( !isPasswordValid ) {
      return null;
    }

    return user;
  }

  generateToken( payload: JwtPayload ): string {
    const secret = process.env.JWT_SECRET;

    if ( !secret ) {
      throw new Error( 'JWT_SECRET is not configured' );
    }

    return jwt.sign( payload, secret, { expiresIn: '7d' } );
  }

  async login(
    username: string,
    password: string,
  ): Promise<{ accessToken: string }> {
    const user = await this.validateUser( username, password );

    if ( !user ) {
      throw new UnauthorizedException( 'Invalid credentials' );
    }

    const accessToken = this.generateToken( {
      sub:      user.id,
      username: user.username,
    } );

    return { accessToken };
  }
}
