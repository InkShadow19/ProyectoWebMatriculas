import {Injectable} from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({
providedIn: 'root'
})
export class NotificationService {

constructor(private toastr: ToastrService) { }

  showSuccess(message: string, title: string){
    this.toastr.success(message, title, {
      timeOut: 5000
    });
  }

  showError(message: string, title: string){
    this.toastr.error(message, title, {
      timeOut: 5000
    });
  }

  showInfo(message: string, title:string, html?:boolean, time?:number){
    this.toastr.info(message, title, {
      timeOut: time || 5000,
      enableHtml: html || false,
      progressBar: true,
    },)
  }

}
