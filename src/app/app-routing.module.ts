import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReporteComponent } from './reporte/reporte.component';
import { AsesorComponent } from './asesor/asesor.component';
import { AsesorDosComponent } from './asesor-dos/asesor-dos.component';
import { ReportTelecomComponent } from './report-telecom/report-telecom.component';
import { ReportKonectarComponent } from './report-konectar/report-konectar.component';

const routes: Routes = [
  { path: 'reporte-general', component: ReporteComponent, pathMatch: 'full' },
  { path: 'reporte-asesor', component: AsesorComponent},
  { path: 'reporte-asesor-dos', component: AsesorDosComponent},
  { path: 'reporte-telecom', component: ReportTelecomComponent},
  { path: 'reporte-konectar', component: ReportKonectarComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
