import { EstadoTarea, Prioridad, TipoIntervalo, TipoMeta } from './enums';

export interface UsuarioDTO {
  id?: number;
  nombre: string;
  email: string;
  contrasena: string;
  fechaCreacion?: string;
}

export interface TareaDTO {
  id?: number;
  titulo: string;
  descripcion?: string;
  prioridad: Prioridad;
  fechaVencimiento: string; // ISO del backend
  usuario?: Partial<UsuarioDTO>; // usamos {id:?} para asociar
  estado?: EstadoTarea;
  fechaCreacion?: string;
  fechaInicio?: string;
  fechaFinalizacion?: string;
  duracionEstimadaMinutos?: number;
}

export interface CalendarItemDTO {
  tareaId: number;
  titulo: string;
  inicio: string;
  fin: string;
  estado: EstadoTarea;
}

export interface PomodoroDTO {
  id: number;
  usuarioId: number;
  tareaId?: number;
  tipo: TipoIntervalo;
  inicio: string;
  finPlanificado: string;
  finReal?: string;
  duracionMin: number;
  activo: boolean;
}

/* NUEVOS */
export interface ProyectoDTO { id?: number; nombre: string; descripcion?: string; }
export interface NotaDTO     { id?: number; titulo: string; categoria: string; contenido: string; }
export interface HabitoDTO   { id?: number; nombre: string; }
export interface MetaDTO     {
  id?: number;
  titulo: string;
  descripcion: string;
  tipoMeta: TipoMeta;
  fechaLimite?: string; // ISO (opcional)
}

