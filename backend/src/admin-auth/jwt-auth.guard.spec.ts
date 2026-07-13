import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { AuthenticatedRequest, JwtAuthGuard } from './jwt-auth.guard';

describe( 'JwtAuthGuard', () => {
  let guard: JwtAuthGuard;

  const createContext = ( authorization?: string ): ExecutionContext => {
    const request: { headers: { authorization?: string }; user?: unknown } = {
      headers: {},
    };

    if ( authorization !== undefined ) {
      request.headers.authorization = authorization;
    }

    return {
      switchToHttp: () => ( {
        getRequest: () => request,
      } ),
    } as ExecutionContext;
  };

  beforeEach( () => {
    guard = new JwtAuthGuard();
    process.env.JWT_SECRET = 'test-secret';
  } );

  it( 'allows requests with a valid Bearer token', () => {
    const token = jwt.sign(
      { sub: 'admin-1', username: 'admin' },
      'test-secret',
      { expiresIn: '7d' },
    );
    const context = createContext( `Bearer ${ token }` );

    expect( guard.canActivate( context ) ).toBe( true );
    expect(
      context.switchToHttp().getRequest<AuthenticatedRequest>().user,
    ).toMatchObject( {
      sub:      'admin-1',
      username: 'admin',
    } );
  } );

  it( 'throws UnauthorizedException when Authorization header is missing', () => {
    const context = createContext();

    expect( () => guard.canActivate( context ) ).toThrow( UnauthorizedException );
  } );

  it( 'throws UnauthorizedException when Authorization is not Bearer', () => {
    const context = createContext( 'Basic dXNlcjpwYXNz' );

    expect( () => guard.canActivate( context ) ).toThrow( UnauthorizedException );
  } );

  it( 'throws UnauthorizedException when token is invalid', () => {
    const context = createContext( 'Bearer invalid-token' );

    expect( () => guard.canActivate( context ) ).toThrow( UnauthorizedException );
  } );

  it( 'throws UnauthorizedException when token is signed with a different secret', () => {
    const token = jwt.sign(
      { sub: 'admin-1', username: 'admin' },
      'other-secret',
      { expiresIn: '7d' },
    );
    const context = createContext( `Bearer ${ token }` );

    expect( () => guard.canActivate( context ) ).toThrow( UnauthorizedException );
  } );
} );
