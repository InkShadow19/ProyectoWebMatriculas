import { DistribucionGradoDto } from "./distribucion-grado.model";
import { DistribucionNivelDto } from "./distribucion-nivel.model";
import { IngresosVsDeudaDto } from "./ingresos-vs-deuda.model";
import { SituacionAlumnoDto } from "./situacion-alumno.model";
import { TendenciaMatriculaDto } from "./tendencia-matricula.model";

export interface AnalisisAnual {
    totalIngresosDelAnio: number;
    tendenciaMatriculas: TendenciaMatriculaDto[];
    distribucionAlumnosPorNivel: DistribucionNivelDto[];
    ingresosVsDeuda: IngresosVsDeudaDto[];
    distribucionAlumnosPorGrado: DistribucionGradoDto[];
    distribucionSituacion: SituacionAlumnoDto[];
}