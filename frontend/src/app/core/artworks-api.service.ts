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

@Injectable( { providedIn: 'root' } )
export class ArtworksApiService {
  private readonly http    = inject( HttpClient );
  private readonly listUrl = '/api/public/artworks';

  getArtworks(): Observable<PublicArtworkListItem[]> {
    return this.http.get<PublicArtworkListItem[]>( this.listUrl );
  }
}
