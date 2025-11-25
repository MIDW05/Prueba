import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { UsuariosService } from '../../services/usuarios.service';
import { TareasService } from '../../services/tareas.service';
import { PomodoroService } from '../../services/pomodoro.service';
import { ProyectosService } from '../../services/proyectos.service';
import { MetasService } from '../../services/metas.service';
import { HabitosService } from '../../services/habitos.service';

import { CalendarItemDTO, PomodoroDTO, TareaDTO } from '../../models/dtos';
import { TipoIntervalo } from '../../models/enums';

import { FormsModule } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatListModule } from '@angular/material/list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatSelectModule } from '@angular/material/select';

import { interval, Subscription } from 'rxjs';

function toYMD(d: Date) {
  const pad = (n: number) => (n < 10 ? '0' + n : '' + n);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

@Component({
  standalone: true,
  selector: 'app-dashboard',
  imports: [
    CommonModule, FormsModule,
    MatToolbarModule, MatButtonModule, MatIconModule, MatCardModule,
    MatTabsModule, MatListModule, MatFormFieldModule, MatInputModule,
    MatSnackBarModule, MatDatepickerModule, MatNativeDateModule,
    MatDividerModule, MatSelectModule
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class DashboardComponent implements OnInit, OnDestroy {

  private router = inject(Router);
  private usuariosSrv = inject(UsuariosService);
  private tareasSrv = inject(TareasService);
  private pomoSrv = inject(PomodoroService);
  private proyectosSrv = inject(ProyectosService);
  private metasSrv = inject(MetasService);
  private habitosSrv = inject(HabitosService);
  private snack = inject(MatSnackBar);

  usuarioId: number | null = null;

  // --- LISTAS ORIGINALES (se siguen usando para calendario / pomodoro) ---
  pendientes = signal<TareaDTO[]>([]);
  proximas = signal<TareaDTO[]>([]);
  recordatorios = signal<TareaDTO[]>([]);
  dias = signal(3);
  minutos = signal(60);

  desde: Date = new Date();
  hasta: Date = new Date(new Date().getTime() + 6 * 24 * 60 * 60 * 1000);
  calendario = signal<CalendarItemDTO[]>([]);
  minutosBloqueICS = signal(30);

  plan = signal<Array<{ orden: number; tipo: TipoIntervalo; minutos: number }>>([]);
  tipo: TipoIntervalo = 'ENFOQUE';
  duracionMin?: number;
  tareaId?: number;

  activo = signal<PomodoroDTO | null>(null);
  hoy = signal<PomodoroDTO[]>([]);
  restanteSeg = signal(0);
  private tick$?: Subscription;

  icsHref = computed(() =>
    this.usuarioId ? this.tareasSrv.icsUrl(this.usuarioId, this.minutosBloqueICS()) : '#'
  );

  // --- NUEVAS MÉTRICAS PARA EL DASHBOARD ---

  // KPI: tareas de hoy
  tareasHoy = signal<{ completadas: number; totales: number }>({ completadas: 0, totales: 0 });

  // KPI: proyectos, metas, hábitos
  proyectosActivos = signal(0);
  metasEnProgreso = signal(0);
  habitosConfigurados = signal(0);

  // Gráfico: tareas completadas por día (L, M, X, J, V, S, D)
  tareasPorDia = signal<Array<{ dia: string; count: number }>>([
    { dia: 'L', count: 0 },
    { dia: 'M', count: 0 },
    { dia: 'X', count: 0 },
    { dia: 'J', count: 0 },
    { dia: 'V', count: 0 },
    { dia: 'S', count: 0 },
    { dia: 'D', count: 0 },
  ]);

  // Productividad (minutos de enfoque de hoy)
  minutosEnfoqueHoy = signal(0);

  // Actividad reciente (texto generado a partir de tus datos)
  actividadReciente = signal<Array<{ texto: string; detalle: string }>>([]);

  ngOnInit(): void {
    this.usuarioId = this.usuariosSrv.getUsuarioId();
    if (!this.usuarioId) {
      this.router.navigate(['/login']);
      return;
    }

    // Lo “viejo”: tareas + calendario + pomodoro
    this.cargarListas();
    this.cargarCalendario();
    this.pomoSrv.plan().subscribe(p => this.plan.set(p));
    this.cargarHoy();
    this.reconectarPomodoroActivo();

    // Lo “nuevo”: métricas del dashboard
    this.cargarMetricas();
  }

  ngOnDestroy(): void {
    this.stopTick();
  }

  logout() {
    this.usuariosSrv.logout();
    this.router.navigate(['/login']);
  }

  // --- MÉTRICAS DEL DASHBOARD ---

  private cargarMetricas() {
    if (!this.usuarioId) return;
    const uid = this.usuarioId;

    // TAREAS
    this.tareasSrv.listar().subscribe(lista => {
      const mias = lista.filter(t => t.usuario?.id === uid);

      const hoy = new Date();
      const sameDay = (iso?: string) => {
        if (!iso) return false;
        const d = new Date(iso);
        return d.getFullYear() === hoy.getFullYear()
          && d.getMonth() === hoy.getMonth()
          && d.getDate() === hoy.getDate();
      };

      const completadasHoy = mias.filter(t => t.estado === 'COMPLETADA' && sameDay(t.fechaFinalizacion)).length;
      const totalesHoy = mias.filter(t => sameDay(t.fechaVencimiento) || sameDay(t.fechaCreacion)).length || mias.length;

      this.tareasHoy.set({ completadas: completadasHoy, totales: totalesHoy });

      // gráfico barras: tareas completadas por día de la semana
      const labels = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
      const map = new Map<string, number>();
      labels.forEach(l => map.set(l, 0));

      mias.forEach(t => {
        if (t.estado === 'COMPLETADA' && t.fechaFinalizacion) {
          const d = new Date(t.fechaFinalizacion);
          const dow = d.getDay(); // 0=Domingo
          const label = labels[(dow + 6) % 7]; // Lunes primero
          map.set(label, (map.get(label) || 0) + 1);
        }
      });

      this.tareasPorDia.set(labels.map(l => ({ dia: l, count: map.get(l) || 0 })));

      // actividad reciente basada en últimas tareas
      const recientes = mias
        .filter(t => t.estado === 'COMPLETADA' && t.fechaFinalizacion)
        .sort((a, b) => new Date(b.fechaFinalizacion!).getTime() - new Date(a.fechaFinalizacion!).getTime())
        .slice(0, 2)
        .map(t => ({
          texto: `Completaste la tarea "${t.titulo}"`,
          detalle: 'Recientemente'
        }));

      this.actividadReciente.set(recientes);
    });

    // PROYECTOS
    this.proyectosSrv.listar().subscribe(p => {
      this.proyectosActivos.set(p.length);
      if (p.length) {
        const act = this.actividadReciente();
        const ultimo = p[p.length - 1];
        this.actividadReciente.set([
          ...act,
          { texto: `Creaste el proyecto "${ultimo.nombre}"`, detalle: 'Recientemente' }
        ]);
      }
    });

    // METAS
    this.metasSrv.listar().subscribe(m => {
      this.metasEnProgreso.set(m.length);
    });

    // HÁBITOS (los que has configurado)
    this.habitosSrv.listar().subscribe(h => {
      this.habitosConfigurados.set(h.length);
    });
  }

  // --- Tareas / calendario originales ---

  cargarListas() {
    if (!this.usuarioId) return;
    this.tareasSrv.pendientes(this.usuarioId).subscribe(v => this.pendientes.set(v));
    this.tareasSrv.proximas(this.usuarioId, this.dias()).subscribe(v => this.proximas.set(v));
    this.tareasSrv.recordatorios(this.usuarioId, this.minutos()).subscribe(v => this.recordatorios.set(v));
  }

  iniciarTarea(t: TareaDTO) {
    if (!t.id) return;
    this.tareasSrv.iniciar(t.id).subscribe(_ => this.cargarListas());
  }

  completarTarea(t: TareaDTO) {
    if (!t.id) return;
    this.tareasSrv.completar(t.id).subscribe(_ => this.cargarListas());
  }

  cargarCalendario() {
    if (!this.usuarioId) return;
    this.tareasSrv
      .calendario(this.usuarioId, toYMD(this.desde), toYMD(this.hasta))
      .subscribe(v => this.calendario.set(v));
  }

  // --- Pomodoro ---

  iniciarPomodoro() {
    if (!this.usuarioId) return;
    this.pomoSrv.iniciar(this.usuarioId, this.tipo, this.tareaId, this.duracionMin).subscribe(s => {
      this.activo.set(s);
      this.startTick();
      this.snack.open('Pomodoro iniciado', 'OK', { duration: 1500 });
      this.cargarHoy();
    });
  }

  finalizarPomodoro() {
    const s = this.activo();
    if (!s) return;
    this.pomoSrv.finalizar(s.id).subscribe(fin => {
      this.activo.set(fin);
      this.stopTick();
      this.restanteSeg.set(0);
      this.snack.open('Pomodoro finalizado', 'OK', { duration: 2000 });
      this.beep();
      this.cargarHoy();
    });
  }

  private reconectarPomodoroActivo() {
    if (!this.usuarioId) return;
    this.pomoSrv.activo(this.usuarioId).subscribe(s => {
      if (s) {
        this.activo.set(s);
        this.startTick();
      }
    });
  }

  private cargarHoy() {
    if (!this.usuarioId) return;
    this.pomoSrv.hoy(this.usuarioId).subscribe(lista => {
      this.hoy.set(lista);
      const totalEnfoque = lista
        .filter(s => s.tipo === 'ENFOQUE')
        .reduce((acc, s) => acc + s.duracionMin, 0);
      this.minutosEnfoqueHoy.set(totalEnfoque);
    });
  }

  private startTick() {
    this.stopTick();
    const s = this.activo();
    if (!s) return;
    this.tick$ = interval(1000).subscribe(() => {
      const fin = new Date(s.finPlanificado).getTime();
      const now = Date.now();
      const rem = Math.max(0, Math.floor((fin - now) / 1000));
      this.restanteSeg.set(rem);
      if (rem <= 0) {
        this.finalizarPomodoro();
      }
    });
  }

  private stopTick() {
    this.tick$?.unsubscribe();
    this.tick$ = undefined;
  }

  private beep() {
    try {
      const Ctx = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (Ctx) {
        const ctx = new Ctx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.value = 880;
        gain.gain.setValueAtTime(0.0001, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + 0.01);
        osc.start();
        setTimeout(() => {
          osc.stop();
          ctx.close();
        }, 400);
      }
    } catch {}

    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification('⏱ Pomodoro terminado');
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission();
      }
    }
  }
}
