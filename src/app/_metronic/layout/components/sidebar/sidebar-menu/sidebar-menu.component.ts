import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/modules/auth/services/auth.service';

@Component({
  selector: 'app-sidebar-menu',
  templateUrl: './sidebar-menu.component.html',
  styleUrls: ['./sidebar-menu.component.scss']
})
export class SidebarMenuComponent implements OnInit {

  constructor(private authService: AuthService){ }

  ngOnInit(): void {
  }

  isAdmin(): boolean {
    return this.authService.hasRole('Administrador');
  }

}
