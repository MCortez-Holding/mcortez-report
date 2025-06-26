import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReporteComponent } from './reporte/reporte.component';
import { AsesorComponent } from './asesor/asesor.component';
import { AsesorDosComponent } from './asesor-dos/asesor-dos.component';

const routes: Routes = [
  { path: 'reporte-general', component: ReporteComponent, pathMatch: 'full' },
  { path: 'reporte-asesor', component: AsesorComponent},
  { path: 'reporte-asesor-dos', component: AsesorDosComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
