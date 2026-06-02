/* addaddress.component.ts */
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { Address } from '../../../core/models/address.model';
import { AddressService } from '../../../core/services/address.service';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-address',
  standalone: true,
  imports: [ CommonModule, RouterLink ],
  templateUrl: './address.component.html',
  styleUrl: './address.component.css'
})
export class AddressComponent implements OnInit {

  /* ob: direcciones del usuario actual */
  addresses$!: Observable<Address[]>;

  constructor(
    private addressService: AddressService,
    private router: Router,    
  ) {}

  ngOnInit(): void {
    this.addresses$ = this.addressService.getAddressesByUser();
  }
    
  onUpdateAddress(address: Address): void {

    this.router.navigate(['/addAddress'], {
      state: {
        addressToEdit: address
      }
    });

  } /* end onUpdateAddress */
  
  onDeleteAddress( addressId?: string ): void {

    if( !addressId ) return;
    
    Swal.fire({
      title: '¿Eliminar la dirección?',
      text: 'Está accion es permanente y no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Si, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.addressService.deleteAddress(addressId).subscribe(() => {
          this.addresses$ = this.addressService.getAddressesByUser();
        });

        Swal.fire({
          icon: 'success',
          title: 'Dirección eliminada',
          text: 'La dirección fue removida correctamente.',
          showConfirmButton: true
        });
      }
    });
  } /* end onDeleteAddress */

} /* end AddressComponent */