/* form-addaddress.component.ts */
import { Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AddressService } from '../../../core/services/address.service';
import { AuthService } from '../../../core/services/auth.service';
import Swal from 'sweetalert2';
import { Address } from '../../../core/models/address.model';

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
  
  addressForm: FormGroup;
  
  streetTouched: boolean =false;
  numberTouched: boolean = false;
  neighborhood: boolean = false;
  postalCodeTouched: boolean = false;
  cityTouched: boolean = false;
  stateTouched: boolean = false;
  phoneTouched: boolean = false;
  cellPhoneTouched: boolean = false;
  
  private addressService: AddressService = inject(AddressService);
  private authService: AuthService = inject(AuthService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  constructor() {    
    this.addressForm = this.fb.group({
      street: ['', Validators.required],
      number: ['', Validators.required],
      neighborhood: ['', Validators.required],
      postalCode: ['', [Validators.required, Validators.pattern(/^\d{5}$/)]],
      municipality: ['', Validators.required],
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
        municipality: addressToEdit.municipality,
        city: addressToEdit.city,
        state: addressToEdit.state,
        phone: addressToEdit.phone,

        cellPhone: addressToEdit.cellPhone,

      });      
    }    
  } /* end ngOnInit */
  
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

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      Swal.fire({
        icon: 'error',
        title: 'Sesión no válida',
        text: 'No se puede identificar al usuario actual.'
      });
      return;
    }

    const newAddress: Omit<Address, '_id'> = {
      user: currentUser._id,
      street: this.addressForm.value.street,
      number: this.addressForm.value.number,
      neighborhood: this.addressForm.value.neighborhood,
      postalCode: this.addressForm.value.postalCode,
      city: this.addressForm.value.city,
      state: this.addressForm.value.state,
      phone: this.addressForm.value.phone,
      cellPhone: this.addressForm.value.cellPhone,
      isDefault: this.addresses.length === 0,
      municipality: this.addressForm.value.municipality,
    };

    if (this.addressToEdit && this.addressToEdit._id) {

      this.addressService
        .updateAddress(this.addressToEdit._id, newAddress)
        .subscribe(() => {

          Swal.fire({
            icon: 'success',
            title: 'Dirección actualizada',
            text: 'La dirección fue modificada correctamente.',
          });

          this.router.navigate(['/direcciones']);
        });

    } else {

      this.addressService
        .createAddress(newAddress)
        .subscribe(() => {

          Swal.fire({
            icon: 'success',
            title: 'Dirección registrada',
            text: 'Tu nueva dirección fue guardada exitosamente.',
          });

          this.router.navigate(['/direcciones']);
        });

    }

    this.addressForm.reset();
    this.resetTouchedFlags();
  } /* end onSubmit */
  
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
  } /* end confirmCancel */

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
  } /* end resetForm */

  resetTouchedFlags(): void {
    this.streetTouched = false;
    this.numberTouched = false;
    this.neighborhood = false;
    this.postalCodeTouched = false;
    this.cityTouched = false;
    this.stateTouched = false;
    this.phoneTouched = false;
    this.cellPhoneTouched = false;
  } /* end resetTouchedFlags */
  
  isFormReady(): boolean {
    return this.addressForm.valid && Object.keys(this.addressForm.controls).every(key => {
      const control = this.addressForm.get(key);
      return control?.touched;
    });
  } /* end isFormReady */
  
  showAlert(type: 'success' | 'error', message: string): void {
    Swal.fire({
      icon: type,
      title: 'Aviso',
      text: message,
      showConfirmButton: true
    });
  } /* end showAlert */
  
  goToAddresses(): void {
    this.router.navigate(['/direcciones']);
  } /* end goToAddresses */

} /* end FormAddAddressComponent */