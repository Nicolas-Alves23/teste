import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Motor, MotorPayload } from '../models/motor.model';

@Injectable({ providedIn: 'root' })
export class MotorService {
  private readonly baseUrl = `${environment.apiUrl}/motores`;

  constructor(private readonly http: HttpClient) {}

  listar(search?: string): Observable<Motor[]> {
    let params = new HttpParams();
    if (search && search.trim() !== '') {
      params = params.set('search', search.trim());
    }
    return this.http.get<Motor[]>(this.baseUrl, { params });
  }

  criar(payload: MotorPayload): Observable<Motor> {
    return this.http.post<Motor>(this.baseUrl, payload);
  }

  atualizar(id: number, payload: MotorPayload): Observable<Motor> {
    return this.http.put<Motor>(`${this.baseUrl}/${id}`, payload);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
