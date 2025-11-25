import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { UsuariosService } from '../../services/usuarios.service';
import { UsuarioDTO } from '../../models/dtos';

@Component({
  standalone: true,
  selector: 'app-register',
  imports: [CommonModule, FormsModule],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class RegisterComponent {

  private usuariosSrv = inject(UsuariosService);
  private router = inject(Router);

  // Datos del formulario
  nuevo: UsuarioDTO = { nombre: '', email: '', contrasena: '' };
  confirmPassword = '';

  // Mensaje de error simple
  errorMsg = '';

  registrar() {
    this.errorMsg = '';

    // Validaciones básicas
    if (!this.nuevo.nombre || !this.nuevo.email || !this.nuevo.contrasena || !this.confirmPassword) {
      this.errorMsg = 'Por favor completa todos los campos.';
      return;
    }

    if (this.nuevo.contrasena.length < 6) {
      this.errorMsg = 'La contraseña debe tener al menos 6 caracteres.';
      return;
    }

    if (this.nuevo.contrasena !== this.confirmPassword) {
      this.errorMsg = 'Las contraseñas no coinciden.';
      return;
    }

    this.usuariosSrv.crear(this.nuevo).subscribe({
      next: (u) => {
        if (u.id) {
          this.usuariosSrv.setUsuarioId(u.id);
          this.router.navigate(['/app/dashboard']);
        }
      },
      error: () => {
        this.errorMsg = 'No se pudo registrar el usuario. Inténtalo de nuevo.';
      }
    });
  }

  irALogin() {
    this.router.navigate(['/login']);
  }
}
