import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { DashboardService } from 'src/app/services/dashboard.service';
import { DashboardData } from 'src/app/models/dashboard-data.model';
import { AnioAcademicoService } from 'src/app/services/anio-academico.service';
import { AnioAcademicoDto } from 'src/app/models/anio-academico.model';
import { AnalisisAnual } from 'src/app/models/analisis-anual.model';
import { ApexChart, ApexNonAxisChartSeries, ApexXAxis, ApexAxisChartSeries, ApexDataLabels, ApexStroke, ApexYAxis, ApexFill, ApexTooltip, ApexLegend } from 'ng-apexcharts';
import { NivelDto } from 'src/app/models/nivel.model';
import { NivelService } from 'src/app/services/nivel.service';

// Definimos nuestros propios tipos para mayor claridad y flexibilidad
export type TendenciaChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  colors: string[];
};

export type DistribucionChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  labels: any;
  colors: string[];
  legend: ApexLegend;
};

export type IngresosVsDeudaChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  dataLabels: ApexDataLabels;
  stroke: ApexStroke;
  yaxis: ApexYAxis;
  fill: ApexFill;
  tooltip: ApexTooltip;
  colors: string[];
};

export type DistribucionGradoChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  plotOptions: ApexPlotOptions;
  colors: string[];
};

export type DistribucionSituacionChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  labels: any;
  colors: string[];
  legend: ApexLegend;
};

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {

  // --- Sección 1: KPIs Fijos ---
  kpiFijos: DashboardData | undefined;

  // --- Sección 2: Análisis por Año ---
  analisisAnual: AnalisisAnual | undefined;
  anios: AnioAcademicoDto[] = [];
  niveles: NivelDto[] = [];
  anioSeleccionadoId: string = '';
  filtroNivelIdAnalisis: string = '';

  // --- Usamos nuestros tipos personalizados ---
  public tendenciaChartOptions: TendenciaChartOptions;
  public distribucionChartOptions: DistribucionChartOptions;
  public ingresosVsDeudaChartOptions: IngresosVsDeudaChartOptions;
  public distribucionGradoChartOptions: DistribucionGradoChartOptions;
  public distribucionSituacionChartOptions: DistribucionSituacionChartOptions;

  public showGradoChart = true;

  constructor(
    private dashboardService: DashboardService,
    private anioAcademicoService: AnioAcademicoService,
    private nivelService: NivelService,
    private cdr: ChangeDetectorRef
  ) {
    // --- GRÁFICO DE LÍNEAS ---
    this.tendenciaChartOptions = {
      series: [],
      chart: { type: 'line', height: 420, toolbar: { show: true } },
      xaxis: { categories: [] },
      colors: ['#098866ff']
    };

    // --- GRÁFICO CIRCULAR ---
    this.distribucionChartOptions = {
      series: [],
      chart: { type: 'pie', width: '85%', height: 300 },
      labels: [],
      colors: ['#1F2937', '#3bc1f6ff', '#bdbdbdff'],
      legend: { position: 'bottom' }
    };

    // --- GRÁFICO DE BARRAS DOBLE ---
    this.ingresosVsDeudaChartOptions = {
      series: [],
      chart: { type: 'bar', height: 420 },
      xaxis: { categories: [] },
      colors: ['#50CD89', '#F1416C'],
      yaxis: { title: { text: 'Soles' } },
      tooltip: { y: { formatter: (val) => 'S/ ' + val.toLocaleString('es-PE') } },
      dataLabels: { enabled: false },
      stroke: { show: true, width: 2, colors: ['transparent'] },
      fill: { opacity: 1 }
    };

    // --- GRÁFICO DE BARRAS HORIZONTALES ---
    this.distribucionGradoChartOptions = {
      series: [],
      chart: { type: 'bar', height: 350 },
      plotOptions: { bar: { horizontal: true } },
      xaxis: {
        categories: [],
        labels: {
          formatter: function (val) {
            return Number(val).toFixed(0);
          }
        }
      },
      colors: ['#5170ff']
    };

    this.distribucionSituacionChartOptions = {
        series: [],
        chart: { type: 'donut', height: 350 },
        labels: [],
        colors: ['#41cef1ff', '#a241f1e8', '#F1416C'],
        legend: { position: 'bottom' }
    };
  }

  ngOnInit(): void {
    this.loadKpiFijos();
    this.loadAnios();
    this.nivelService.getList(0, 100).subscribe(res => this.niveles = res?.content || []);
  }

  loadKpiFijos(): void {
    this.dashboardService.getKpiFijosData().subscribe(data => {
      this.kpiFijos = data;
      this.cdr.detectChanges();
    });
  }

  loadAnios(): void {
    this.anioAcademicoService.getList(0, 100).subscribe(response => {
      this.anios = response?.content || [];
      const anioActivo = this.anios.find(a => a.estadoAcademico === 'ACTIVO');
      if (anioActivo) {
        this.anioSeleccionadoId = anioActivo.identifier;
      } else if (this.anios.length > 0) {
        this.anioSeleccionadoId = this.anios[0].identifier;
      }
      // Carga los datos del análisis después de establecer el año por defecto
      this.loadAnalisisAnualData();
    });
  }

  // --- MÉTODO PRINCIPAL PARA LA SECCIÓN 2 ---
  loadAnalisisAnualData(): void {
    if (!this.anioSeleccionadoId) return;

    this.dashboardService.getAnalisisAnualData(this.anioSeleccionadoId, this.filtroNivelIdAnalisis).subscribe(data => {
      this.analisisAnual = data;
      if (data) {
        this.tendenciaChartOptions.series = [{ name: 'Nuevas Matrículas', data: data.tendenciaMatriculas.map(d => d.total) }];
        this.tendenciaChartOptions.xaxis.categories = data.tendenciaMatriculas.map(d => d.mes);

        this.distribucionChartOptions.series = data.distribucionAlumnosPorNivel.map(d => d.total);
        this.distribucionChartOptions.labels = data.distribucionAlumnosPorNivel.map(d => d.nivel);

        this.ingresosVsDeudaChartOptions.series = [
          { name: 'Ingresos', data: data.ingresosVsDeuda.map(d => d.ingresos) },
          { name: 'Deuda Vencida', data: data.ingresosVsDeuda.map(d => d.deudaVencida) }
        ];
        this.ingresosVsDeudaChartOptions.xaxis.categories = data.ingresosVsDeuda.map(d => d.mes);

        this.showGradoChart = false;

        const gradoData = data.distribucionAlumnosPorGrado || [];
        this.distribucionGradoChartOptions.series = [{ name: 'Total de Alumnos', data: gradoData.map(d => d.total) }];
        this.distribucionGradoChartOptions.xaxis = {
          ...this.distribucionGradoChartOptions.xaxis,
          categories: gradoData.map(d => d.grado)
        };

        setTimeout(() => {
          this.showGradoChart = true;
          this.cdr.detectChanges();
        }, 0);

        const situacionData = data.distribucionSituacion || [];
        this.distribucionSituacionChartOptions.series = situacionData.map(d => d.total);
        this.distribucionSituacionChartOptions.labels = situacionData.map(d => d.situacion);
      }
      this.cdr.detectChanges();
    });
  }
}