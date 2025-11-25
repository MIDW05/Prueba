import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { CalendarItemDTO, TareaDTO } from '../models/dtos';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TareasService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/tareas`;

  listar(): Observable<TareaDTO[]> {
    return this.http.get<TareaDTO[]>(this.base);
  }

  crear(dto: TareaDTO): Observable<TareaDTO> {
    return this.http.post<TareaDTO>(this.base, dto);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  pendientes(usuarioId: number): Observable<TareaDTO[]> {
    const params = new HttpParams().set('usuarioId', usuarioId);
    return this.http.get<TareaDTO[]>(`${this.base}/pendientes`, { params });
  }

  proximas(usuarioId: number, dias = 3): Observable<TareaDTO[]> {
    const params = new HttpParams().set('usuarioId', usuarioId).set('dias', dias);
    return this.http.get<TareaDTO[]>(`${this.base}/proximas`, { params });
  }

  recordatorios(usuarioId: number, minutos = 60): Observable<TareaDTO[]> {
    const params = new HttpParams().set('usuarioId', usuarioId).set('minutos', minutos);
    return this.http.get<TareaDTO[]>(`${this.base}/recordatorios`, { params });
  }

  iniciar(id: number): Observable<TareaDTO> {
    return this.http.post<TareaDTO>(`${this.base}/${id}/iniciar`, {});
  }

  completar(id: number): Observable<TareaDTO> {
    return this.http.post<TareaDTO>(`${this.base}/${id}/completar`, {});
  }

  calendario(usuarioId: number, desdeYYYYMMDD: string, hastaYYYYMMDD: string): Observable<CalendarItemDTO[]> {
    const params = new HttpParams()
      .set('usuarioId', usuarioId)
      .set('desde', desdeYYYYMMDD)
      .set('hasta', hastaYYYYMMDD);
    return this.http.get<CalendarItemDTO[]>(`${this.base}/calendario`, { params });
  }

  icsUrl(usuarioId: number, minutosBloque = 30): string {
    return `${environment.apiUrl}/calendar/usuario/${usuarioId}.ics?minutosBloqueEvento=${minutosBloque}`;
  }
}
