import { CanMatchFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { UsuariosService } from './services/usuarios.service';

export const authGuard: CanMatchFn = () => {
  const router = inject(Router);
  const usuariosSrv = inject(UsuariosService);
  const ok = !!usuariosSrv.getUsuarioId();
  if (!ok) router.navigate(['/login']);
  return ok;
};
