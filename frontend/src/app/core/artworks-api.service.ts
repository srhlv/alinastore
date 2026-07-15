import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export type PublicArtworkStatus = 'AVAILABLE' | 'SOLD';

export type PublicArtworkListItem = {
  id:             string;
  titleUk:        string;
  titleEn:        string;
  status:         PublicArtworkStatus;
  thumbnailUrl:   string | null;
  minOptionPrice: number | null;
};

export type PublicArtworkPhoto = {
  id:        string;
  url:       string;
  isMain:    boolean;
  sortOrder: number;
};

export type PublicArtworkOption = {
  id:            string;
  nameUk:        string;
  nameEn:        string;
  descriptionUk: string | null;
  descriptionEn: string | null;
  price:         number | string;
};

export type PublicArtworkDetail = {
  id:            string;
  titleUk:       string;
  titleEn:       string;
  descriptionUk: string | null;
  descriptionEn: string | null;
  status:        PublicArtworkStatus;
  photos:        PublicArtworkPhoto[];
  options:       PublicArtworkOption[];
};

@Injectable( { providedIn: 'root' } )
export class ArtworksApiService {
  private readonly http    = inject( HttpClient );
  private readonly listUrl = '/api/public/artworks';

  getArtworks(): Observable<PublicArtworkListItem[]> {
    return this.http.get<PublicArtworkListItem[]>( this.listUrl );
  }

  getArtwork( id: string ): Observable<PublicArtworkDetail> {
    return this.http.get<PublicArtworkDetail>( `${ this.listUrl }/${ id }` );
  }
}
