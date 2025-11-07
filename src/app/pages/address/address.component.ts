import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { Address } from '../../core/models/address.model';
import { AddressService } from '../../core/services/address.service';
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
    private router: Router
  ) {}

  ngOnInit(): void {
    this.addresses$ = this.addressService.getAddressesByCurrentUser();
  }


  /* mt: agregar dirección */
  onAddToAddress( address: Address ): void {

    /* ob: obtener usuario actual */
    const currentUser = this.addressService['authService'].getCurrentUser();
    if (!currentUser) {
      Swal.fire({
        icon: 'warning',
        title: 'Sesión no iniciada',
        text: 'Debes iniciar sesión para agregar una dirección.',
        confirmButtonText: 'Aceptar'
      });
      return;
    }

    /* mt: guardar dirección */
    this.addressService.addAddressForUser(currentUser.idUser, address);

    Swal.fire({
      icon: 'success',
      title: 'Dirección agregada',
      text: 'La dirección fue guardada correctamente.',
      confirmButtonText: 'Perfecto'
    });
  }

  /* mt: actualizar dirección */
  onUpdateAddress(index: number): void {
    const currentUser = this.addressService['authService'].getCurrentUser();
    if (!currentUser) return;

    const userAddresses = this.addressService.getAddressesByUser(currentUser.idUser);
    const addressToEdit = userAddresses[index];

    if (!addressToEdit) return;

    history.pushState(null, '', '');
    window.location.href = '/addAddress?edit=true';

    window.history.replaceState(null, '', '');

    this.router.navigate(['/addAddress'], {
      state: {
        addressToEdit,
        editIndex: index
      }
    });
  }
  
  /* mt: eliminar dirección */
  onDeleteAddress(index: number): void {
    const currentUser = this.addressService['authService'].getCurrentUser();
    if (!currentUser) return;

    Swal.fire({
      title: '¿Eliminar la dirección?',
      text: 'Está accion es permanente y no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Si, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.addressService.deleteAddressForUser(currentUser.idUser, index);
        Swal.fire({
          icon: 'success',
          title: 'Dirección eliminada',
          text: 'La dirección fue removida correctamente.',
          showConfirmButton: true
        });
      }
    });
  }

}