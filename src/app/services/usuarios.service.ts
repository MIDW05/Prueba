import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UsuarioDTO } from '../models/dtos';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UsuariosService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/usuarios`;
  private key = 'usuarioId';

  listar(): Observable<UsuarioDTO[]> {
    return this.http.get<UsuarioDTO[]>(this.base);
  }

  crear(dto: UsuarioDTO): Observable<UsuarioDTO> {
    return this.http.post<UsuarioDTO>(this.base, dto);
  }

  setUsuarioId(id: number) {
    localStorage.setItem(this.key, String(id));
  }

  getUsuarioId(): number | null {
    const v = localStorage.getItem(this.key);
    return v ? Number(v) : null;
  }

  logout() {
    localStorage.removeItem(this.key);
  }
}
