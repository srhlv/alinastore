import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';
import { JwtPayload } from './admin-auth.service';

export type AuthenticatedRequest = Request & {
  user: JwtPayload;
};

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate( context: ExecutionContext ): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token   = this.extractTokenFromHeader( request );

    if ( !token ) {
      throw new UnauthorizedException();
    }

    const secret = process.env.JWT_SECRET;

    if ( !secret ) {
      throw new Error( 'JWT_SECRET is not configured' );
    }

    try {
      const payload = jwt.verify( token, secret ) as JwtPayload;
      request.user  = payload;
      return true;
    } catch {
      throw new UnauthorizedException();
    }
  }

  private extractTokenFromHeader( request: Request ): string | undefined {
    const [ type, token ] = request.headers.authorization?.split( ' ' ) ?? [];

    return type === 'Bearer' ? token : undefined;
  }
}
