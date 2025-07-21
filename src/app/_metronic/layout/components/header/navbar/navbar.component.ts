import { Component, OnInit, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService, UserInfo } from 'src/app/modules/auth/services/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
})
export class NavbarComponent implements OnInit {

  @Input() appHeaderDefaulMenuDisplay: boolean = false;
  @Input() isRtl: boolean = false;

  itemClass: string = 'ms-1 ms-md-4';
  btnClass: string = 'btn btn-icon btn-custom btn-icon-muted btn-active-light btn-active-color-primary w-35px h-35px';
  userAvatarClass: string = 'cursor-pointer symbol-35px symbol-md-40px';
  
  user$: Observable<UserInfo | null>;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.user$ = this.authService.currentUser$;
  }

  getUserInitial(username: string | undefined): string {
    if (!username) {
      return '?';
    }
    return username.charAt(0).toUpperCase();
  }
}