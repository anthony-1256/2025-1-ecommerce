/* company-info.service.ts */
import { Injectable } from '@angular/core';

export type CompanyInfo = {
  name: string;  
  rfc: string;
};

export type CompanyBranch = {
  id: string,
  name: string,
  address: string,
  phone: string,
  email: string
};

@Injectable({
  providedIn: 'root'
})
export class CompanyInfoService {

  private readonly companyData: CompanyInfo & { branches: CompanyBranch[] } = {    
    name: 'FullStorage S.A. de C.V.',
    rfc: 'EMP123456789',
    branches: [
      {
        id: '1',
        name: 'Fullstorage CDMX',
        address: 'Av. Siempre Viva 742, Ciudad de México',        
        phone: '(55) 1234-567-89-10',
        email: 'contacto@fullstorage.com.mx'        
      }
    ]
  };

  getBranchById( branchId: string ): CompanyBranch | undefined {
    return this.companyData.branches.find( b => b.id === branchId );
  }

  getCompanyWithBranch( branchId: string ): CompanyInfo & { branches: CompanyBranch[], branch?: CompanyBranch } {
    const branch = this.getBranchById( branchId );

    return {
      ...this.companyData,
      branch
    };
  }

}