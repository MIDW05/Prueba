import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { ProyectoDTO } from '../models/dtos';

@Injectable({ providedIn: 'root' })
export class ProyectosService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/proyectos`;

  listar(): Observable<ProyectoDTO[]> { return this.http.get<ProyectoDTO[]>(this.base); }
  crear(dto: ProyectoDTO): Observable<ProyectoDTO> { return this.http.post<ProyectoDTO>(this.base, dto); }
  editar(dto: ProyectoDTO): Observable<ProyectoDTO> { return this.http.put<ProyectoDTO>(this.base, dto); }
  borrar(id: number): Observable<void> { return this.http.delete<void>(`${this.base}/${id}`); }
}
