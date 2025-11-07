/***** src/app/pages/forms/form-addaddress/form-addaddress.component.ts *****/

import { Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AddressService } from '../../../core/services/address.service';
import { AuthService } from '../../../core/services/auth.service';
import Swal from 'sweetalert2';
import { Address } from '../../../core/models/address.model';
import { DeliveryOption } from '../../../core/types/enums';
import { Router } from '@angular/router';


@Component({
  selector: 'app-form-addaddress',
  standalone: true,
  imports: [ CommonModule, ReactiveFormsModule, FormsModule ],
  templateUrl: './form-addaddress.component.html',
  styleUrl: './form-addaddress.component.css'
})
export class FormAddaddressComponent implements OnInit{

  @Input() addresses: Address[] = [];

  addressToEdit?: Address;
  editIndex?: number;

  /* ob: formulario reactivo para direcccion */
  addressForm: FormGroup;

  /* objetos de control de estado tocado de los imputs */
  streetTouched: boolean =false;
  numberTouched: boolean = false;
  neighborhood: boolean = false;
  postalCodeTouched: boolean = false;
  cityTouched: boolean = false;
  stateTouched: boolean = false;
  phoneTouched: boolean = false;
  cellPhoneTouched: boolean = false;  

  /* ob: servicios inyectados */
  private addressService: AddressService = inject(AddressService);
  private authService: AuthService = inject(AuthService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  constructor() {
    /* mt: inicializar formulario con validaciones básicas */
    this.addressForm = this.fb.group({
      street: ['', Validators.required],
      number: ['', Validators.required],
      neighborhood: ['', Validators.required],
      postalCode: ['', [Validators.required, Validators.pattern(/^\d{5}$/)]],
      city: ['', Validators.required],
      state: ['', Validators.required],
      phone: ['', Validators.required],
      cellPhone: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    const { addressToEdit, editIndex } = history.state;

    if (addressToEdit && typeof editIndex === 'number') {
      this.addressToEdit = addressToEdit;
      this.editIndex = editIndex;
      
      this.addressForm.patchValue({

        street: addressToEdit.street,
        number: addressToEdit.number,
        neighborhood: addressToEdit.neighborhood,

        postalCode: addressToEdit.postalCode,

        city: addressToEdit.city,
        state: addressToEdit.state,
        phone: addressToEdit.phone,

        cellPhone: addressToEdit.cellPhone,

      });      
    }    
  }

  /* mt: enviar formulario para agregar dirección */
  onSubmit(): void {

    /* cn: validar que el formulario esté válido */
    if (this.addressForm.invalid) {
      this.addressForm.markAllAsTouched();
      Swal.fire({
        icon: 'error',
        title: 'Formulario incompleto',
        text: 'Por favor completa todos los campos requeridos correctamente.',
        confirmButtonText: 'Aceptar'
      });
      return;
    }

    const currentUser = this.addressService['authService'].getCurrentUser();
    if (!currentUser) {
      Swal.fire({
        icon: 'error',
        title: 'Sesión no válida',
        text: 'No se puede identificar al usuario actual.'
      });
      return;
    }

    const newAddress: Address = {
      street: this.addressForm.value.street,
      number: this.addressForm.value.number,
      neighborhood: this.addressForm.value.neighborhood,
      postalCode: this.addressForm.value.postalCode,
      city: this.addressForm.value.city,
      state: this.addressForm.value.state,
      phone: this.addressForm.value.phone,
      cellPhone: this.addressForm.value.cellPhone,
      isDefault: this.addresses.length === 0
    };

    if (this.addressToEdit && this.editIndex !== undefined){
      this.addressService.updateAddressForUser(currentUser.idUser, this.editIndex, newAddress);
      Swal.fire({
        icon: 'success',
        title: 'Dirección actualizada',
        text: 'La dirección fue modificada correctamente.',        
      });
    } else {

      /* Modo agregar */
      this.addressService.addAddressForUser(currentUser.idUser, newAddress);
      Swal.fire({
        icon: 'success',
        title: 'Dirección registrada',        
        text: 'Tu nueva dirección fue guardada exitosamente.',
      });
    }

    this.addressForm.reset();
    this.resetTouchedFlags();
  }

  /* mt: confirmar cancelación del formulario */
  confirmCancel(): void {
    if (!this.addressForm.dirty) return;

    Swal.fire({
      title: '¿Quieres cancelar el registro?',
      text: 'Si cancelas, los datos del formulartio se perderán.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'No, volver'
    }).then(result => {

      if (result.isConfirmed) {
        this.resetForm();

        Swal.fire({
          icon: 'info',
          title: 'Registro cancelado',
          text: 'El formulario ha sido limpiado.'
        });
      }
    });
  }

  /* mt: reiniciar formulario */
  resetForm(): void {
    this.addressForm.reset();
    this.streetTouched = false;
    this.numberTouched = false;
    this.neighborhood = false;
    this.postalCodeTouched = false;
    this.cityTouched = false;
    this.stateTouched = false;
    this.phoneTouched = false;
    this.cellPhoneTouched = false;
  }

  resetTouchedFlags(): void {
    this.streetTouched = false;
    this.numberTouched = false;
    this.neighborhood = false;
    this.postalCodeTouched = false;
    this.cityTouched = false;
    this.stateTouched = false;
    this.phoneTouched = false;
    this.cellPhoneTouched = false;
  }

  /* mt: verificar si el formulario está listo para enviar */
  isFormReady(): boolean {
    return this.addressForm.valid && Object.keys(this.addressForm.controls).every(key => {
      const control = this.addressForm.get(key);
      return control?.touched;
    });
  }

  /* mt: mostrar alertas con Sweetalert */
  showAlert(type: 'success' | 'error', message: string): void {
    Swal.fire({
      icon: type,
      title: 'Aviso',
      text: message,
      showConfirmButton: true
    });
  }

  /* mt: regresar a direcciones de usuario */
  goToAddresses(): void {
    this.router.navigate(['/direcciones']);
  }

}
