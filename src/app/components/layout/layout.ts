import { Component, computed, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import {TareasService} from '../../services/tareas.service';
import {UsuariosService} from '../../services/usuarios.service';

@Component({
  standalone: true,
  selector: 'app-layout',
  imports: [
    CommonModule, RouterModule,
    MatSidenavModule, MatListModule, MatToolbarModule, MatIconModule, MatButtonModule
  ],
  templateUrl: './layout.html',
  styleUrl: './layout.scss'
})
export class LayoutComponent {
  private router = inject(Router);
  private tareasSrv = inject(TareasService);
  private usuariosSrv = inject(UsuariosService);

  usuarioId = this.usuariosSrv.getUsuarioId();
  icsHref = computed(() => this.usuarioId ? this.tareasSrv.icsUrl(this.usuarioId, 30) : '#');

  logout() {
    this.usuariosSrv.logout();
    this.router.navigate(['/login']);
  }
}
