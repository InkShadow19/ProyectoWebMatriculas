import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';

@Injectable({
  providedIn: 'root'
})
export class ExcelExportService {

  constructor() { }

  public exportAsExcelFile(json: any[], excelFileName: string): void {
    // 1. Creamos una hoja de cálculo a partir de nuestros datos JSON.
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);

    // 2. Creamos un nuevo libro de trabajo.
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };

    // 3. Generamos el archivo de Excel y disparamos la descarga.
    XLSX.writeFile(workbook, `${excelFileName}.xlsx`);
  }
}