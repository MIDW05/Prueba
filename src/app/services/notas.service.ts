import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { NotaDTO } from '../models/dtos';

@Injectable({ providedIn: 'root' })
export class NotasService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/notas`;

  listar(): Observable<NotaDTO[]> { return this.http.get<NotaDTO[]>(this.base); }
  crear(dto: NotaDTO): Observable<NotaDTO> { return this.http.post<NotaDTO>(this.base, dto); }
  editar(dto: NotaDTO): Observable<NotaDTO> { return this.http.put<NotaDTO>(this.base, dto); }
  borrar(id: number): Observable<void> { return this.http.delete<void>(`${this.base}/${id}`); }
}
