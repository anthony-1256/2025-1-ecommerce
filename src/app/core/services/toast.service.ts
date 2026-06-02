/* toast.service.ts */
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  message: string;
  type: ToastType;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  private toastSubject = new BehaviorSubject< Toast | null >( null );
  public toast$ = this.toastSubject.asObservable();

  success( message: string ): void {
    this.show( message, 'success' );
  } /* End success */

  error( message: string ): void {
    this.show( message, 'error' );
  } /*  End error */

  info( message: string ): void {
    this.show( message, 'info' );
  } /* End info */

  warning( message: string ): void {
    this.show( message, 'warning' );
  }  /* End warning */

  private show( message: string, type: ToastType ): void {
    this.toastSubject.next({ message, type });

    setTimeout(() => {
      this.toastSubject.next( null );
    }, 4000);
  } /* End show */

}