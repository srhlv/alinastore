import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { AdminAuthService } from './admin-auth.service';

export const jwtHttpInterceptor: HttpInterceptorFn = ( req, next ) => {
  const token = inject( AdminAuthService ).getToken();

  if ( !token || !isAdminApiUrl( req.url ) ) {
    return next( req );
  }

  return next(
    req.clone( {
      setHeaders: {
        Authorization: `Bearer ${ token }`,
      },
    } ),
  );
};

function isAdminApiUrl( url: string ): boolean {
  return /\/api\/admin(?:\/|$|\?)/.test( url );
}
