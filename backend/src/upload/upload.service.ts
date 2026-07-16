import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

const DEFAULT_BUCKET = 'artworks';
const MAX_FILE_BYTES = 10 * 1024 * 1024;

@Injectable()
export class UploadService {
  private readonly bucket: string;
  private readonly client: SupabaseClient | null;

  constructor() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    this.bucket = process.env.SUPABASE_STORAGE_BUCKET ?? DEFAULT_BUCKET;
    this.client = url && key ? createClient( url, key ) : null;
  }

  async upload( file: Express.Multer.File | undefined ): Promise<{ url: string }> {
    if ( !file ) {
      throw new BadRequestException( 'File is required' );
    }

    if ( !file.mimetype.startsWith( 'image/' ) ) {
      throw new BadRequestException( 'Only image uploads are allowed' );
    }

    if ( file.size > MAX_FILE_BYTES ) {
      throw new BadRequestException( 'File exceeds 10MB limit' );
    }

    if ( !this.client ) {
      throw new InternalServerErrorException( 'Supabase storage is not configured' );
    }

    const extension = this.extensionFor( file );
    const objectPath = `${ Date.now() }-${ randomUUID() }.${ extension }`;

    const { error } = await this.client.storage
      .from( this.bucket )
      .upload( objectPath, file.buffer, {
        contentType: file.mimetype,
        upsert:      false,
      } );

    if ( error ) {
      throw new InternalServerErrorException( error.message );
    }

    const { data } = this.client.storage.from( this.bucket ).getPublicUrl( objectPath );

    return { url: data.publicUrl };
  }

  private extensionFor( file: Express.Multer.File ): string {
    const fromName = file.originalname.split( '.' ).pop()?.toLowerCase();

    if ( fromName && /^[a-z0-9]+$/.test( fromName ) ) {
      return fromName;
    }

    const fromMime = file.mimetype.split( '/' )[ 1 ];

    return fromMime || 'bin';
  }
}
