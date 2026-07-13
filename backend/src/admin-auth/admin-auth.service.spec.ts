import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as jwt from 'jsonwebtoken';
import { PrismaService } from '../prisma/prisma.service';
import { AdminAuthService } from './admin-auth.service';

jest.mock( 'bcryptjs', () => ( {
  compare: jest.fn(),
} ) );

import * as bcrypt from 'bcryptjs';

const mockedBcryptCompare = bcrypt.compare as jest.MockedFunction<
  typeof bcrypt.compare
>;

describe( 'AdminAuthService', () => {
  let service: AdminAuthService;
  let prisma: {
    adminUser: {
      findUnique: jest.Mock;
    };
  };

  const adminUser = {
    id:        'admin-1',
    username:  'admin',
    password:  'hashed-password',
    createdAt: new Date(),
  };

  beforeEach( async () => {
    prisma = {
      adminUser: {
        findUnique: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule( {
      providers: [
        AdminAuthService,
        {
          provide:  PrismaService,
          useValue: prisma,
        },
      ],
    } ).compile();

    service = module.get( AdminAuthService );
    process.env.JWT_SECRET = 'test-secret';
  } );

  afterEach( () => {
    jest.clearAllMocks();
  } );

  describe( 'validateUser', () => {
    it( 'returns user when credentials are valid', async () => {
      prisma.adminUser.findUnique.mockResolvedValue( adminUser );
      mockedBcryptCompare.mockResolvedValue( true as never );

      await expect( service.validateUser( 'admin', 'secret' ) ).resolves.toEqual(
        adminUser,
      );
    } );

    it( 'returns null when user does not exist', async () => {
      prisma.adminUser.findUnique.mockResolvedValue( null );

      await expect( service.validateUser( 'admin', 'secret' ) ).resolves.toBeNull();
    } );

    it( 'returns null when password is invalid', async () => {
      prisma.adminUser.findUnique.mockResolvedValue( adminUser );
      mockedBcryptCompare.mockResolvedValue( false as never );

      await expect( service.validateUser( 'admin', 'wrong' ) ).resolves.toBeNull();
    } );
  } );

  describe( 'generateToken', () => {
    it( 'creates a JWT signed with JWT_SECRET', () => {
      const token = service.generateToken( {
        sub:      adminUser.id,
        username: adminUser.username,
      } );

      const decoded = jwt.verify( token, 'test-secret' ) as jwt.JwtPayload;

      expect( decoded.sub ).toBe( adminUser.id );
      expect( decoded.username ).toBe( adminUser.username );
      expect( decoded.exp ).toBeDefined();
    } );
  } );

  describe( 'login', () => {
    it( 'returns accessToken for valid credentials', async () => {
      prisma.adminUser.findUnique.mockResolvedValue( adminUser );
      mockedBcryptCompare.mockResolvedValue( true as never );

      const result = await service.login( 'admin', 'secret' );

      expect( result.accessToken ).toEqual( expect.any( String ) );
      expect( jwt.verify( result.accessToken, 'test-secret' ) ).toBeTruthy();
    } );

    it( 'throws UnauthorizedException for invalid credentials', async () => {
      prisma.adminUser.findUnique.mockResolvedValue( null );

      await expect( service.login( 'admin', 'wrong' ) ).rejects.toThrow(
        UnauthorizedException,
      );
    } );
  } );
} );
