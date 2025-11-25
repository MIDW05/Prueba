import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { UsuariosService } from '../../services/usuarios.service';
import { UsuarioDTO } from '../../models/dtos';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-usuarios-page',
  imports: [CommonModule, FormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatListModule, MatIconModule],
  templateUrl: './usuarios-page.html',
  styleUrl: './usuarios-page.scss'
})
export class UsuariosPageComponent implements OnInit {
  private srv = inject(UsuariosService);
  private router = inject(Router);

  lista = signal<UsuarioDTO[]>([]);
  nuevo: UsuarioDTO = { nombre: '', email: '', contrasena: '' };

  ngOnInit(): void { this.srv.listar().subscribe(v => this.lista.set(v)); }

  crear() {
    if (!this.nuevo.nombre || !this.nuevo.email || !this.nuevo.contrasena) return;
    this.srv.crear(this.nuevo).subscribe(u => {
      this.nuevo = { nombre: '', email: '', contrasena: '' };
      this.srv.listar().subscribe(v => this.lista.set(v));
    });
  }

  usar(u: UsuarioDTO) {
    if (!u.id) return;
    this.srv.setUsuarioId(u.id);
    this.router.navigate(['/app/dashboard']);
  }
}
