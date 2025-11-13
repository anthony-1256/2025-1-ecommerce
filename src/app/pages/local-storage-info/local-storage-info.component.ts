import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-local-storage-info',
  standalone: true,
  imports: [ CommonModule ],
  templateUrl: './local-storage-info.component.html',
  styleUrl: './local-storage-info.component.css'
})
export class LocalStorageInfoComponent implements OnInit, OnDestroy {

  usage = {
    usedMB: 0,
    limitMB: 5,
    details: [] as { key: string; bytes: number; mb: number } []
  };
  usedPercent = 0;
  color = 'bg-success';
  private intervalId: any;
  
  ngOnInit(): void {
    this.updateUsage();
    this.intervalId = setInterval(() => this.updateUsage(), 1000);    
  }

  ngOnDestroy(): void {
    clearInterval(this.intervalId);    
  }
  
  getLocalStorageUSage(): {
    usedMB: number;
    limitMB: number;
    details: { key: string; bytes: number; mb: number }[];
  } {    
    let totalBytes = 0;
    const limitMB = 5;
    const details: { key: string; bytes: number; mb: number }[] = [];
    for ( let i =0; i < localStorage.length; i++ ) {
      const maybeKey = localStorage.key(i);
      if ( maybeKey === null ) continue;
      const key = maybeKey;
      const value =localStorage.getItem(key) ?? '';
      const bytes = ( key.length + value.length ) * 2;
      totalBytes += bytes;
      details.push({
        key,
        bytes,
        mb: parseFloat((bytes / (1024 * 1024)).toFixed(4))
      });
    }
    const usedMB = parseFloat((totalBytes / (1024 * 1024)).toFixed(2));
    return { usedMB, limitMB, details };
  }

  /* fn: updateUsage */
  public updateUsage( showAlert = false ): void {
    let totalBytes = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key) || '';
        totalBytes += key.length * 2 + value.length * 2;
      }
    }

    const usedMB = totalBytes / ( 1024 * 1024 );
    this.usage.usedMB = parseFloat(usedMB.toFixed(2));
    const percent = ( usedMB / this.usage.limitMB ) * 100;

    if (percent < 50) this.color = 'bg-success';
    else if (percent > 80) this.color = 'bg-warning';
    else this.color= 'bg-danger';

    if (showAlert) {
      Swal.fire({
        title: 'Actualizado',
        text: 'Uso de almacenamiento actualizado correctamente.',
        icon: 'success',
        showConfirmButton: true,
        confirmButtonText: 'Ok'
      });
    }    
  }

  /* mt: clearStorageKey */
  clearStorageKey(key: string, confirmBefore = true): void {
    if (!key) return;

    const salesKeys = [
      'sales',
      'historicSalesSynced_v1',
      'app_sales_v1',
      'app_sales_by_user',
      ...Object.keys(localStorage).filter(k => k.startsWith('receipts_user_'))
    ];

    const isSalesClear = key === 'app_sales_v1';
    const title = isSalesClear
      ? '¿Eliminar historial de compras?'
      : `¿Eliminar clave'${key}'?`;
    const text = isSalesClear
      ? 'Se eliminarán todas las claves relacionadas con el historial de ventas.'
      : 'Esta acción no se puede deshacer.';
    
    if ( confirmBefore ) {
      Swal.fire({
        title,
        text,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      }).then(result => {
        if (result.isConfirmed) {

          if (isSalesClear) {
            salesKeys.forEach(k => {
              localStorage.removeItem(k);
            });
            console.log('[local-storage-info] Historial de compras eliminado:', salesKeys);
          } else {
            localStorage.removeItem(key);
            console.log(`[local-storage-info] Removed localStorage key: ${key}`);
          }
          this.updateUsage();
          Swal.fire({
            title: 'Eliminado',
            text: isSalesClear
            ? 'Historial de compras eliminado correctamente.'
            : `La clave '${key}' fue eliminada.`,
            icon: 'success',            
            showConfirmButton: true,
            confirmButtonText: 'Ok'
          });
        }
      });
    }
  }

  clearCategory(category: string ): void {
    const keysToDelete = [
      'app_sales_by_user',
      'app_sales_v1',
      'historicSalesSynced_v1',
      'userFavorites',
      'cart'
    ];
    keysToDelete
      .filter( k => k.includes(category))
      .forEach( k => localStorage.removeItem(k));
    this.updateUsage();
  }

  clearMutipleKeys( keys: string[], confirmBefore = true ): void {
    if ( !keys || keys.length === 0 ) return;
    if (confirmBefore) {
      const ok = confirm (`¿Eliminar las siguientes claves del localStorage?\n${keys.join(', ')}`);
      if (!ok) return;
    }
    keys.forEach(k => localStorage.removeItem(k));
    console.log(`[local-storage-info] Removed keys: ${keys.join(', ')}`);
    this.updateUsage();
  }

  clearAll(): void {
    localStorage.clear();
    this.updateUsage();
  }

}
