import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { HabitoDTO } from '../models/dtos';

@Injectable({ providedIn: 'root' })
export class HabitosService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/habitos`;

  listar(): Observable<HabitoDTO[]> { return this.http.get<HabitoDTO[]>(this.base); }
  crear(dto: HabitoDTO): Observable<HabitoDTO> { return this.http.post<HabitoDTO>(this.base, dto); }
  editar(dto: HabitoDTO): Observable<HabitoDTO> { return this.http.put<HabitoDTO>(this.base, dto); }
  borrar(id: number): Observable<void> { return this.http.delete<void>(`${this.base}/${id}`); }
}
