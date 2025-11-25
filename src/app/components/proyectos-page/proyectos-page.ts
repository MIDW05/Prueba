import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { ProyectosService } from '../../services/proyectos.service';
import { ProyectoDTO } from '../../models/dtos';

// Campos extra SOLO para la vista (el backend puede ignorarlos)
type ProyectoView = ProyectoDTO & {
  progresoPorc?: number;
  tareasCompletadas?: number;
  tareasTotales?: number;
};

@Component({
  standalone: true,
  selector: 'app-proyectos-page',
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './proyectos-page.html',
  styleUrl: './proyectos-page.scss'
})
export class ProyectosPageComponent implements OnInit {

  private srv = inject(ProyectosService);
  private snack = inject(MatSnackBar);

  proyectos = signal<ProyectoView[]>([]);
  edit?: ProyectoView;
  showForm = false;

  form = {
    nombre: '',
    descripcion: ''
  };

  ngOnInit(): void {
    this.cargar();
  }

  cargar() {
    this.srv.listar().subscribe(list => {
      // Adaptamos a ProyectoView con valores por defecto
      const adaptados: ProyectoView[] = list.map((p, idx) => ({
        ...p,
        progresoPorc: (p as any).progresoPorc ?? 0,
        tareasCompletadas: (p as any).tareasCompletadas ?? 0,
        tareasTotales: (p as any).tareasTotales ?? 0
      }));
      this.proyectos.set(adaptados);
    });
  }

  abrirNuevo() {
    this.edit = undefined;
    this.form = { nombre: '', descripcion: '' };
    this.showForm = true;
  }

  editarProyecto(p: ProyectoView) {
    this.edit = p;
    this.form = {
      nombre: p.nombre,
      descripcion: p.descripcion ?? ''
    };
    this.showForm = true;
  }

  cancelar() {
    this.edit = undefined;
    this.showForm = false;
    this.form = { nombre: '', descripcion: '' };
  }

  guardar() {
    const nombre = this.form.nombre.trim();
    const descripcion = this.form.descripcion.trim();

    if (!nombre) return;

    const payload: ProyectoDTO = {
      id: this.edit?.id,
      nombre,
      descripcion
    };

    const obs = this.edit?.id ? this.srv.editar(payload) : this.srv.crear(payload);

    obs.subscribe({
      next: () => {
        this.snack.open('Proyecto guardado', 'OK', { duration: 1500 });
        this.cancelar();
        this.cargar();
      },
      error: () => this.snack.open('No se pudo guardar el proyecto', 'OK', { duration: 2000 })
    });
  }

  borrar(p: ProyectoView) {
    if (!p.id) return;
    if (!confirm(`¿Eliminar proyecto "${p.nombre}"?`)) return;

    this.srv.borrar(p.id).subscribe({
      next: () => {
        this.snack.open('Proyecto eliminado', 'OK', { duration: 1500 });
        this.cargar();
      },
      error: () => this.snack.open('No se pudo eliminar el proyecto', 'OK', { duration: 2000 })
    });
  }

  // Para alternar colores de tarjetas e iconos
  cardColorClass(index: number): string {
    const colors = ['card--blue', 'card--green', 'card--purple'];
    return colors[index % colors.length];
  }
}
