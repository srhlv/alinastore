import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export type SubmitOrderItem = {
  artworkId: string;
  optionId:  string;
  quantity:  number;
};

export type SubmitOrderPayload = {
  customerName: string;
  contactInfo:  string;
  items:        SubmitOrderItem[];
};

export type SubmitOrderResponse = {
  id:     string;
  status: string;
  total:  number | string;
};

@Injectable( { providedIn: 'root' } )
export class OrdersApiService {
  private readonly http     = inject( HttpClient );
  private readonly ordersUrl = '/api/public/orders';

  submitOrder( payload: SubmitOrderPayload ): Observable<SubmitOrderResponse> {
    return this.http.post<SubmitOrderResponse>( this.ordersUrl, payload );
  }
}
