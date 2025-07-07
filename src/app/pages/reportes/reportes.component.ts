import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/_metronic/shared/shared.module';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, FormsModule, SharedModule],
  templateUrl: './reportes.component.html',
  styleUrls: ['./reportes.component.scss']
})
export class ReportesComponent implements OnInit {

  // --- Estado de la Interfaz ---
  reporteSeleccionado: string | null = null;
  mostrarResultados: boolean = false;
  tituloReporteGenerado: string = '';

  // --- Datos para los Filtros (Ejemplos) ---
  niveles: string[] = ['Inicial', 'Primaria', 'Secundaria'];
  grados: string[] = ['1er Grado', '2do Grado', '3er Grado']; // Deberían cargarse dinámicamente

  // --- Modelo para los Filtros ---
  filtros: any = {
    busquedaEstudiante: '',
    nivel: '',
    grado: '',
    fechaInicio: '',
    fechaFin: ''
  };

  constructor() { }

  ngOnInit(): void {
  }

  /**
   * Maneja la selección de una de las tarjetas de reporte.
   * @param tipo El tipo de reporte seleccionado (ej. 'estado-cuenta').
   */
  seleccionarReporte(tipo: string): void {
    // Si se hace clic en la misma tarjeta, no hacer nada o deseleccionar
    if (this.reporteSeleccionado === tipo) {
      this.reporteSeleccionado = null;
      this.mostrarResultados = false;
    } else {
      this.reporteSeleccionado = tipo;
      // Resetea los filtros y resultados al cambiar de reporte
      this.limpiarFiltros();
      this.mostrarResultados = false;
    }
  }

  /**
   * Simula la generación del reporte.
   */
  generarReporte(): void {
    if (!this.reporteSeleccionado) {
      // Opcional: mostrar una notificación
      console.warn('Ningún reporte seleccionado');
      return;
    }
    
    // Lógica de generación (aquí iría la llamada al servicio/backend)
    console.log('Generando reporte:', this.reporteSeleccionado);
    console.log('Con filtros:', this.filtros);

    // Actualiza el título y muestra la sección de resultados
    const card = document.querySelector(`.report-card[data-report="${this.reporteSeleccionado}"] h3`);
    if(card){
        this.tituloReporteGenerado = `Resultados: ${card.textContent}`;
    }
    this.mostrarResultados = true;
  }

  /**
   * Limpia los valores de los filtros.
   */
  limpiarFiltros(): void {
    this.filtros = {
      busquedaEstudiante: '',
      nivel: '',
      grado: '',
      fechaInicio: '',
      fechaFin: ''
    };
  }
}