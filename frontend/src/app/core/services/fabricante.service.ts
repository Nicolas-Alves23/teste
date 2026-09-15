import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Fabricante } from '../models/fabricante.model';

@Injectable({ providedIn: 'root' })
export class FabricanteService {
  private readonly baseUrl = `${environment.apiUrl}/fabricantes`;

  constructor(private readonly http: HttpClient) {}

  listar(): Observable<Fabricante[]> {
    return this.http.get<Fabricante[]>(this.baseUrl);
  }
}
