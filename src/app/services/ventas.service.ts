import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API } from '../const/API';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class VentasService {

  private username = 'kevinrrdev';
  private password = 'KD3z*1112099xD';

  constructor(private http: HttpClient) { }

  private getAuthHeaders(): HttpHeaders {
    const credentials = btoa(`${this.username}:${this.password}`);
    return new HttpHeaders({
      'Authorization': `Basic ${credentials}`
    });
  }

  getVentas(fechaInicio: Date, fechaFin: Date, salas: String = ""): Observable<any[]> {
    const formatDate = (date: Date) => date.toISOString().split('T')[0];

    const formData = new FormData();
    formData.append('fechaIni', formatDate(fechaInicio));
    formData.append('fechaFin', formatDate(fechaFin));
    formData.append('grupo', salas.toString());

    const url = `${API.url}/reportGeneral.php?op=tableReportDay`;

    return this.http.post<any[]>(url, formData, {
      headers: this.getAuthHeaders()
    });
  }
  getVentasTelecom(fechaInicio: Date, fechaFin: Date, salas: String = ""): Observable<any[]> {
    const formatDate = (date: Date) => date.toISOString().split('T')[0];

    const formData = new FormData();
    formData.append('fechaIni', formatDate(fechaInicio));
    formData.append('fechaFin', formatDate(fechaFin));
    formData.append('grupo', salas.toString());

    const url = `${API.urlRomy}/reportGeneral.php?op=tableReportDay`;

    return this.http.post<any[]>(url, formData, {
      headers: this.getAuthHeaders()
    });
  }
  getVentasKonectar(fechaInicio: Date, fechaFin: Date, salas: String = ""): Observable<any[]> {
    const formatDate = (date: Date) => date.toISOString().split('T')[0];

    const formData = new FormData();
    formData.append('fechaIni', formatDate(fechaInicio));
    formData.append('fechaFin', formatDate(fechaFin));
    formData.append('grupo', salas.toString());

    const url = `${API.urlKonectar}/reportGeneral.php?op=tableReportDay`;

    return this.http.post<any[]>(url, formData, {
      headers: this.getAuthHeaders()
    });
  }
  getVentasInstaladas(fechaInicio: Date, fechaFin: Date): Observable<any[]> {
   const formatDate = (date: Date) => date.toISOString().split('T')[0];

    const formData = new FormData();
    formData.append('fechaIni', formatDate(fechaInicio));
    formData.append('fechaFin', formatDate(fechaFin));

    const url = `${API.urlKonectar}/reportGeneral.php?op=tableReportInstaladas`;

    return this.http.post<any[]>(url, formData, {
      headers: this.getAuthHeaders()
    });
  }
  getVentasInstaladasTelecomp(fechaIni: Date, fechaFin: Date): Observable<any[]> {
    const formatDate = (date: Date) => date.toISOString().split('T')[0];

    const formData = new FormData();
    formData.append('fechaIni', formatDate(fechaIni));
    formData.append('fechaFin', formatDate(fechaFin));

    const url = `${API.urlRomy}/reportGeneral.php?op=tableReportInstaladas`;

    return this.http.post<any[]>(url, formData, {
      headers: this.getAuthHeaders()
    });
  }
}
