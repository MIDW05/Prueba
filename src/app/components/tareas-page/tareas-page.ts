import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import { TareasService } from '../../services/tareas.service';
import { UsuariosService } from '../../services/usuarios.service';
import { TareaDTO, UsuarioDTO } from '../../models/dtos';
import { EstadoTarea, Prioridad } from '../../models/enums';

@Component({
  standalone: true,
  selector: 'app-tareas-page',
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatCheckboxModule,
    MatSnackBarModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './tareas-page.html',
  styleUrl: './tareas-page.scss'
})
export class TareasPageComponent implements OnInit {

  private tareasSrv = inject(TareasService);
  private usuariosSrv = inject(UsuariosService);
  private snack = inject(MatSnackBar);

  usuarioId = this.usuariosSrv.getUsuarioId();

  // Todas las tareas desde el backend
  tareas = signal<TareaDTO[]>([]);

  // Tab actual
  tab: 'ACTIVAS' | 'COMPLETADAS' = 'ACTIVAS';

  // Controla si se muestra el formulario de nueva tarea
  showForm = false;

  // Formulario de nueva tarea
  form: {
    titulo: string;
    descripcion: string;
    prioridad: Prioridad;
    fechaVenc: Date;
    duracion: number;
  } = {
    titulo: '',
    descripcion: '',
    prioridad: 'MEDIA',
    fechaVenc: new Date(),
    duracion: 60
  };

  readonly PRIORIDADES: Prioridad[] = ['BAJA', 'MEDIA', 'ALTA'];

  ngOnInit(): void {
    this.cargar();
  }

  // ===== Carga =====
  cargar() {
    this.tareasSrv.listar().subscribe(list => this.tareas.set(list));
  }

  // ===== KPIs =====
  totalTareas() {
    return this.tareas().length;
  }

  pendientesCount() {
    return this.tareas().filter(t => t.estado !== 'COMPLETADA').length;
  }

  completadasCount() {
    return this.tareas().filter(t => t.estado === 'COMPLETADA').length;
  }

  // ===== Listas por pestaña =====
  tareasActivas(): TareaDTO[] {
    return this.tareas().filter(t => t.estado !== 'COMPLETADA');
  }

  tareasCompletadas(): TareaDTO[] {
    return this.tareas().filter(t => t.estado === 'COMPLETADA');
  }

  // ===== Crear tarea =====
  guardarNueva() {
    if (!this.usuarioId) {
      this.snack.open('Selecciona/crea un usuario primero', 'OK', { duration: 2000 });
      return;
    }

    const dto: TareaDTO = {
      titulo: this.form.titulo.trim(),
      descripcion: this.form.descripcion?.trim(),
      prioridad: this.form.prioridad,
      fechaVencimiento: this.form.fechaVenc.toISOString(),
      usuario: { id: this.usuarioId } as UsuarioDTO,
      duracionEstimadaMinutos: this.form.duracion
    };

    if (!dto.titulo) return;

    this.tareasSrv.crear(dto).subscribe({
      next: () => {
        this.snack.open('Tarea creada', 'OK', { duration: 1500 });
        this.form = {
          titulo: '',
          descripcion: '',
          prioridad: 'MEDIA',
          fechaVenc: new Date(),
          duracion: 60
        };
        this.showForm = false;
        this.cargar();
      },
      error: () => this.snack.open('No se pudo crear la tarea', 'OK', { duration: 2000 })
    });
  }

  // Cambio desde el input type="date"
  onFechaChange(value: string | null) {
    if (value) {
      this.form.fechaVenc = new Date(value);
    }
  }

  // ===== Acciones sobre tareas =====
  toggleComplete(t: TareaDTO) {
    // Solo completar, no regresamos a pendiente
    if (!t.id || t.estado === 'COMPLETADA') return;

    this.tareasSrv.completar(t.id).subscribe(() => {
      this.snack.open('Tarea completada', 'OK', { duration: 1200 });
      this.cargar();
    });
  }

  eliminar(t: TareaDTO) {
    if (!t.id) return;
    if (!confirm(`¿Eliminar "${t.titulo}"?`)) return;

    this.tareasSrv.eliminar(t.id).subscribe(() => {
      this.snack.open('Tarea eliminada', 'OK', { duration: 1200 });
      this.cargar();
    });
  }

  prioridadClass(p: Prioridad) {
    return {
      'priority--alta': p === 'ALTA',
      'priority--media': p === 'MEDIA',
      'priority--baja': p === 'BAJA'
    };
  }
}
