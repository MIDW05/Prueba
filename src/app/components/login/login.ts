import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { UsuariosService } from '../../services/usuarios.service';
import { UsuarioDTO } from '../../models/dtos';

// Si quieres usar MatCard o botones de Material puedes importarlos aquí,
// pero la vista nueva usa HTML nativo, así que solo dejo Forms + Common.

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class LoginComponent implements OnInit {

  private usuariosSrv = inject(UsuariosService);
  private router = inject(Router);

  usuarios = signal<UsuarioDTO[]>([]);

  // Formulario de login
  login = {
    email: '',
    password: ''
  };

  ngOnInit(): void {
    // Cargamos usuarios para validar email + password en el front
    this.usuariosSrv.listar().subscribe(u => this.usuarios.set(u));
  }

  entrar() {
    const email = this.login.email.trim();
    const pass = this.login.password;

    if (!email || !pass) {
      alert('Ingresa tu email y contraseña');
      return;
    }

    const user = this.usuarios().find(
      u => u.email === email && u.contrasena === pass
    );

    if (!user || !user.id) {
      alert('Credenciales inválidas');
      return;
    }

    this.usuariosSrv.setUsuarioId(user.id);
    this.router.navigate(['/app/dashboard']);
  }

  goRegister() {
    this.router.navigate(['/register']);
  }
}
