import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export type AdminOrderStatus = 'NEW' | 'CONTACTED' | 'DONE';

export type AdminOrderItem = {
  id:           string;
  orderId:      string;
  artworkId:    string;
  artworkTitle: string;
  optionName:   string;
  optionPrice:  number | string;
  quantity:     number;
};

export type AdminOrder = {
  id:           string;
  customerName: string;
  contactInfo:  string;
  total:        number | string;
  status:       AdminOrderStatus;
  cartJson:     unknown;
  createdAt:    string;
  updatedAt:    string;
  items:        AdminOrderItem[];
};

export type AdminOrderStatusUpdate = 'CONTACTED' | 'DONE';

@Injectable( { providedIn: 'root' } )
export class AdminOrdersApiService {
  private readonly http       = inject( HttpClient );
  private readonly ordersUrl  = '/api/admin/orders';

  list(): Observable<AdminOrder[]> {
    return this.http.get<AdminOrder[]>( this.ordersUrl );
  }

  get( id: string ): Observable<AdminOrder> {
    return this.http.get<AdminOrder>( `${ this.ordersUrl }/${ id }` );
  }

  updateStatus( id: string, status: AdminOrderStatusUpdate ): Observable<AdminOrder> {
    return this.http.patch<AdminOrder>( `${ this.ordersUrl }/${ id }/status`, { status } );
  }

  hardDelete( id: string ): Observable<void> {
    return this.http.delete<void>( `${ this.ordersUrl }/${ id }` );
  }
}
