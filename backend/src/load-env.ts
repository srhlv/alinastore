import { config } from 'dotenv';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const envPaths = [
  resolve( process.cwd(), '.env' ),
  resolve( __dirname, '../.env' ),
];

for ( const envPath of envPaths ) {
  if ( existsSync( envPath ) ) {
    config( { path: envPath } );
    break;
  }
}
