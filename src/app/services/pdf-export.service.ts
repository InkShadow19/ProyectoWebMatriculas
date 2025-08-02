import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { UserOptions } from 'jspdf-autotable';

// Necesitamos extender la interfaz de jsPDF para que reconozca el plugin autoTable
interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: UserOptions) => jsPDF;
}

@Injectable({
  providedIn: 'root'
})
export class PdfExportService {

  constructor() { }

  exportToPdf(title: string, headers: string[][], data: any[][], fileName: string): void {
    // Ya no es necesario castear el tipo aquí
    const doc = new jsPDF();

    // --- CAMBIO 1: Centrar el título ---
    // Obtenemos el ancho de la página y calculamos el centro.
    const pageWidth = doc.internal.pageSize.getWidth();
    doc.setFontSize(14);
    // Usamos la opción { align: 'center' } para centrar el texto en la coordenada X.
    doc.text(title, pageWidth / 2, 20, { align: 'center' });

    // CAMBIO 2: Usamos la función 'autoTable' directamente, pasando el objeto 'doc' como primer argumento
    autoTable(doc, {
      head: headers,
      body: data,
      startY: 28, // Posición vertical donde empieza la tabla
      headStyles: {
        fillColor: [243, 196, 20], // Un color oscuro para la cabecera
        textColor: [0, 0, 0],
        fontSize: 9,
        halign: 'center'
      },
      bodyStyles: {
        fontSize: 8 // Achicamos la letra del contenido a 8
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245] // Color para filas alternas
      },
      // Para la fila del total en "Pagos por Periodo", la estilizamos para que resalte
      didParseCell: function (data) {
        // Primero, nos aseguramos de que 'raw' sea un array
        if (Array.isArray(data.row.raw) && data.row.raw[4] === 'Total de Ingresos:') {
            data.cell.styles.fillColor = [38, 50, 56];
            data.cell.styles.textColor = [255, 255, 255];
            data.cell.styles.fontStyle = 'bold';
        }
      }
    });

    // Guardamos el archivo
    doc.save(`${fileName}.pdf`);
  }
}