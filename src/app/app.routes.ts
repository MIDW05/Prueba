import { Routes } from '@angular/router';

import { LoginComponent } from './components/login/login';
import { RegisterComponent } from './components/register/register';
import { DashboardComponent } from './components/dashboard/dashboard';
import { authGuard } from './auth.guard';
import {LayoutComponent} from './components/layout/layout';
import {TareasPageComponent} from './components/tareas-page/tareas-page';
import {ProyectosPageComponent} from './components/proyectos-page/proyectos-page';
import {NotasPageComponent} from './components/notas-page/notas-page';
import {MetasPageComponent} from './components/metas-page/metas-page';
import {HabitosPageComponent} from './components/habitos-page/habitos-page';
import {UsuariosPageComponent} from './components/usuarios-page/usuarios-page';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  {
    path: 'app',
    component: LayoutComponent,
    canMatch: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },

      { path: 'tareas', component: TareasPageComponent },
      { path: 'proyectos', component: ProyectosPageComponent },
      { path: 'notas', component: NotasPageComponent },
      { path: 'metas', component: MetasPageComponent },
      { path: 'habitos', component: HabitosPageComponent },
      { path: 'usuarios', component: UsuariosPageComponent },
    ]
  },

  { path: '**', redirectTo: 'login' }
];
