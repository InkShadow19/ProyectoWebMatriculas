import { Component, OnInit } from '@angular/core';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/_metronic/shared/shared.module';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-gestion-academica',
  standalone: true,
  imports: [CommonModule, RouterModule, SharedModule],
  templateUrl: './gestion-academica.component.html',
})
export class GestionAcademicaComponent implements OnInit {
  activeTab: 'niveles' | 'grados' = 'niveles';

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Escucha los cambios en la ruta para saber qué pestaña está activa
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        if (event.urlAfterRedirects.includes('/grados')) {
          this.activeTab = 'grados';
        } else {
          this.activeTab = 'niveles';
        }
      });
  }
}
