import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { HttpClientModule } from '@angular/common/http';
import { HttpClientInMemoryWebApiModule } from 'angular-in-memory-web-api';
import { ClipboardModule } from 'ngx-clipboard';
import { TranslateModule } from '@ngx-translate/core';
import { InlineSVGModule } from 'ng-inline-svg-2';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthService } from './modules/auth/services/auth.service';
import { environment } from 'src/environments/environment';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { CommonModule } from '@angular/common';
// #fake-start#
import { FakeAPIService } from './_fake/fake-api.service';
import { BancosComponent } from './pages/bancos/bancos.component';
import { ConceptosPagoComponent } from './pages/conceptos-pago/conceptos-pago.component';
import { AniosAcademicosComponent } from './pages/anios-academicos/anios-academicos.component';
import { EstudiantesComponent } from './pages/estudiantes/estudiantes.component';
import { ApoderadosComponent } from './pages/apoderados/apoderados.component';
import { RolesComponent } from './pages/roles/roles.component';
import { UserComponent } from './pages/admin/user/user.component';
import { NivelesComponent } from './pages/niveles/niveles.component';
import { GradosComponent } from './pages/grados/grados.component';
import { ReportesComponent } from './pages/reportes/reportes.component';
// #fake-end#

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    CommonModule,
    BancosComponent,
    ConceptosPagoComponent,
    AniosAcademicosComponent,
    EstudiantesComponent,
    ApoderadosComponent,
    RolesComponent,
    UserComponent,
    NivelesComponent,
    GradosComponent,
    ReportesComponent,
    BrowserModule,
    BrowserAnimationsModule,
    TranslateModule.forRoot(),
    HttpClientModule,
    ClipboardModule,
    ToastrModule.forRoot({
      timeOut: 3000,
      positionClass: 'toast-bottom-right',
      preventDuplicates: true,
    }),
    // #fake-start#
    environment.isMockEnabled
      ? HttpClientInMemoryWebApiModule.forRoot(FakeAPIService, {
        passThruUnknownUrl: true,
        dataEncapsulation: false,
      })
      : [],
    // #fake-end#
    AppRoutingModule,
    InlineSVGModule.forRoot(),
    NgbModule,
    SweetAlert2Module.forRoot(),
  ],
  providers: [
    
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
