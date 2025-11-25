import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { NotasService } from '../../services/notas.service';
import { NotaDTO } from '../../models/dtos';

@Component({
  standalone: true,
  selector: 'app-notas-page',
  imports: [CommonModule, FormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatListModule, MatIconModule],
  templateUrl: './notas-page.html',
  styleUrl: './notas-page.scss'
})
export class NotasPageComponent implements OnInit {
  private srv = inject(NotasService);
  lista = signal<NotaDTO[]>([]);
  edit?: NotaDTO;
  form: NotaDTO = { titulo: '', categoria: '', contenido: '' };

  ngOnInit(): void { this.load(); }
  load() { this.srv.listar().subscribe(v => this.lista.set(v)); }
  guardar() {
    const payload = { id: this.edit?.id, ...this.form };
    const obs = this.edit?.id ? this.srv.editar(payload) : this.srv.crear(this.form);
    obs.subscribe(() => { this.cancelar(); this.load(); });
  }
  borrar(n: NotaDTO) { if (n.id) this.srv.borrar(n.id).subscribe(() => this.load()); }
  editar(n: NotaDTO) { this.edit = n; this.form = { titulo: n.titulo, categoria: n.categoria, contenido: n.contenido }; }
  cancelar() { this.edit = undefined; this.form = { titulo: '', categoria: '', contenido: '' }; }
}
