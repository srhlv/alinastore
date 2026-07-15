import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export type AdminArtStatus = 'AVAILABLE' | 'SOLD' | 'DELETED';

export type AdminArtworkPhoto = {
  id:        string;
  url:       string;
  isMain:    boolean;
  sortOrder: number;
};

export type AdminArtworkOption = {
  id:            string;
  nameUk:        string;
  nameEn:        string;
  descriptionUk: string | null;
  descriptionEn: string | null;
  price:         number | string;
};

export type AdminArtwork = {
  id:            string;
  titleUk:       string;
  titleEn:       string;
  descriptionUk: string | null;
  descriptionEn: string | null;
  status:        AdminArtStatus;
  createdAt:     string;
  updatedAt:     string;
  photos:        AdminArtworkPhoto[];
  options:       AdminArtworkOption[];
};

export type AdminArtworkOptionPayload = {
  nameUk:         string;
  nameEn:         string;
  descriptionUk?: string;
  descriptionEn?: string;
  price:          number;
};

export type AdminArtworkPayload = {
  titleUk:        string;
  titleEn:        string;
  descriptionUk?: string;
  descriptionEn?: string;
  options:        AdminArtworkOptionPayload[];
};

export type AdminUploadResponse = {
  url: string;
};

@Injectable( { providedIn: 'root' } )
export class AdminArtworksApiService {
  private readonly http         = inject( HttpClient );
  private readonly artworksUrl  = '/api/admin/artworks';
  private readonly uploadUrl    = '/api/admin/upload';

  list(): Observable<AdminArtwork[]> {
    return this.http.get<AdminArtwork[]>( this.artworksUrl );
  }

  create( payload: AdminArtworkPayload ): Observable<AdminArtwork> {
    return this.http.post<AdminArtwork>( this.artworksUrl, payload );
  }

  update( id: string, payload: AdminArtworkPayload ): Observable<AdminArtwork> {
    return this.http.put<AdminArtwork>( `${ this.artworksUrl }/${ id }`, payload );
  }

  updateStatus( id: string, status: AdminArtStatus ): Observable<AdminArtwork> {
    return this.http.patch<AdminArtwork>( `${ this.artworksUrl }/${ id }/status`, { status } );
  }

  softDelete( id: string ): Observable<AdminArtwork> {
    return this.http.delete<AdminArtwork>( `${ this.artworksUrl }/${ id }` );
  }

  hardDelete( id: string ): Observable<void> {
    return this.http.delete<void>( `${ this.artworksUrl }/${ id }/permanent` );
  }

  upload( file: File ): Observable<AdminUploadResponse> {
    const body = new FormData();
    body.append( 'file', file );
    return this.http.post<AdminUploadResponse>( this.uploadUrl, body );
  }

  addPhoto(
    artworkId: string,
    body:      { url: string; isMain?: boolean; sortOrder?: number },
  ): Observable<AdminArtworkPhoto> {
    return this.http.post<AdminArtworkPhoto>(
      `${ this.artworksUrl }/${ artworkId }/photos`,
      body,
    );
  }

  removePhoto( artworkId: string, photoId: string ): Observable<void> {
    return this.http.delete<void>(
      `${ this.artworksUrl }/${ artworkId }/photos/${ photoId }`,
    );
  }

  updatePhoto(
    artworkId: string,
    photoId:   string,
    body:      { isMain?: boolean; sortOrder?: number },
  ): Observable<AdminArtworkPhoto> {
    return this.http.patch<AdminArtworkPhoto>(
      `${ this.artworksUrl }/${ artworkId }/photos/${ photoId }`,
      body,
    );
  }
}
