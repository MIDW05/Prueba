import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { PomodoroDTO } from '../models/dtos';
import { TipoIntervalo } from '../models/enums';

@Injectable({ providedIn: 'root' })
export class PomodoroService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/pomodoro`;

  iniciar(usuarioId: number, tipo: TipoIntervalo, tareaId?: number, duracionMin?: number): Observable<PomodoroDTO> {
    let params = new HttpParams()
      .set('usuarioId', usuarioId)
      .set('tipo', tipo);
    if (tareaId) params = params.set('tareaId', tareaId);
    if (duracionMin) params = params.set('duracionMin', duracionMin);
    return this.http.post<PomodoroDTO>(`${this.base}/iniciar`, {}, { params });
  }

  finalizar(sesionId: number): Observable<PomodoroDTO> {
    return this.http.post<PomodoroDTO>(`${this.base}/${sesionId}/finalizar`, {});
  }

  activo(usuarioId: number): Observable<PomodoroDTO | null> {
    const params = new HttpParams().set('usuarioId', usuarioId);
    return this.http.get<PomodoroDTO | null>(`${this.base}/activo`, { params });
  }

  hoy(usuarioId: number): Observable<PomodoroDTO[]> {
    const params = new HttpParams().set('usuarioId', usuarioId);
    return this.http.get<PomodoroDTO[]>(`${this.base}/hoy`, { params });
  }

  plan(): Observable<Array<{ orden: number; tipo: TipoIntervalo; minutos: number }>> {
    return this.http.get<Array<{ orden: number; tipo: TipoIntervalo; minutos: number }>>(`${this.base}/plan`);
  }
}
