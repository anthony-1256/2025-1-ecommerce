import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';

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
    window.addEventListener('storage', () => this.updateUsage());
  }

  ngOnDestroy(): void {
    clearInterval(this.intervalId);
    window.removeEventListener('storage', () => this.updateUsage());
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

  public updateUsage(): void {
    let totalBytes = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key) || '';
        totalBytes += key.length * 2 + value.length * 2;
      }
    }
    const usedMB = totalBytes / (1024 * 1024);
    this.usage.usedMB = parseFloat(usedMB.toFixed(2));
    const percent = (usedMB / this.usage.limitMB) * 100;
    if ( percent < 50 ) this.color = 'bg-success';
    else if (percent < 80) this.color = 'bg-warning';
    else this.color = 'bg-danger';
  }

  clearStorageKey(key: string, confirmBefore = true): void {
    if (!key) return;
    if (confirmBefore) {
      const ok = confirm(`¿Eliminar '${key}' del localStorage? Esta acción no se puede deshacer.`);
      if (!ok) return;
    }
    localStorage.removeItem(key);
    console.log(`[local-storage-info] Removed localStorage key: ${key}`);
    this.updateUsage();
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
