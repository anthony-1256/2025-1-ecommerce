import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CompanyInfoService {

  private readonly companyData = {
    name: 'FullStorage S.A. de C.V.',
    address: 'Av. Siempre Viva 742, Ciudad de México',
    rfc: 'EMP123456789',
    phone: '(55) 1234-567-89-10',
    email: 'contacto@fullstorage.com.mx'
  };

  getCompanyData() {
    return this.companyData;
  }
  
}
