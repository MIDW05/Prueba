import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MetasService } from '../../services/metas.service';
import { MetaDTO } from '../../models/dtos';
import { TipoMeta } from '../../models/enums';

@Component({
  standalone: true,
  selector: 'app-metas-page',
  imports: [CommonModule, FormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatDatepickerModule, MatNativeDateModule, MatButtonModule, MatListModule, MatIconModule],
  templateUrl: './metas-page.html',
  styleUrl: './metas-page.scss'
})
export class MetasPageComponent implements OnInit {
  private srv = inject(MetasService);
  tipos: TipoMeta[] = ['SALUD', 'APRENDIZAJE', 'PERSONAL', 'PROFESIONAL'];

  lista = signal<MetaDTO[]>([]);
  edit?: MetaDTO;
  form: { titulo: string; descripcion: string; tipoMeta: TipoMeta; fecha?: Date | null } =
    { titulo: '', descripcion: '', tipoMeta: 'PERSONAL', fecha: null };

  ngOnInit(): void { this.load(); }
  load() { this.srv.listar().subscribe(v => this.lista.set(v)); }

  private toISO(d: Date | null | undefined) { return d ? new Date(d).toISOString().substring(0, 10) : undefined; }

  guardar() {
    const payload: MetaDTO = {
      id: this.edit?.id,
      titulo: this.form.titulo,
      descripcion: this.form.descripcion,
      tipoMeta: this.form.tipoMeta,
      fechaLimite: this.toISO(this.form.fecha)
    };
    const obs = this.edit?.id ? this.srv.editar(payload) : this.srv.crear(payload);
    obs.subscribe(() => { this.cancelar(); this.load(); });
  }

  editar(m: MetaDTO) {
    this.edit = m;
    this.form = {
      titulo: m.titulo,
      descripcion: m.descripcion,
      tipoMeta: m.tipoMeta,
      fecha: m.fechaLimite ? new Date(m.fechaLimite) : null
    };
  }
  borrar(m: MetaDTO) { if (m.id) this.srv.borrar(m.id).subscribe(() => this.load()); }
  cancelar() { this.edit = undefined; this.form = { titulo: '', descripcion: '', tipoMeta: 'PERSONAL', fecha: null }; }
}
