import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { MetaDTO } from '../models/dtos';

@Injectable({ providedIn: 'root' })
export class MetasService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/metas`;

  listar(): Observable<MetaDTO[]> { return this.http.get<MetaDTO[]>(this.base); }
  crear(dto: MetaDTO): Observable<MetaDTO> { return this.http.post<MetaDTO>(this.base, dto); }
  editar(dto: MetaDTO): Observable<MetaDTO> {
    return this.http.put<MetaDTO>(`${this.base}/${dto.id}`, dto);
  }

  borrar(id: number): Observable<void> { return this.http.delete<void>(`${this.base}/${id}`); }
}
