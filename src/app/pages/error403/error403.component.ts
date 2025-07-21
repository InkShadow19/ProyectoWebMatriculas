import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-error403',
  templateUrl: './error403.component.html',
  styleUrls: ['./error403.component.scss'],
})
export class Error403Component {
  constructor(private router: Router) {}

  routeToDashboard() {
    this.router.navigate(['/dashboard']);
  }
}