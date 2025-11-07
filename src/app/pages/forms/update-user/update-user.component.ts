/***** src/app/pages/forms/update-user/update-user.component.html *****/
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { User } from '../../../core/models/user.model';
import Swal from 'sweetalert2';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-update-user',
  standalone: true,
  imports: [ CommonModule, ReactiveFormsModule, RouterLink ],
  templateUrl: './update-user.component.html',
  styleUrl: './update-user.component.css'
})
export class UpdateUserComponent {

  /* Roles de control */
  isUser = false;
  isAdmin = false;
  isAdminMaster = false;

  currentUser: User | null = null;
  personalDataForm!: FormGroup;
  activeSeccion: 'form' | 'confirm' = 'form';

  constructor( private fb: FormBuilder ) {}

  ngOnInit(): void {
    const userData = localStorage.getItem('currentUser');
    this.currentUser = userData ? JSON.parse(userData) : null;

    if (this.currentUser) {
      this.personalDataForm = this.fb.group({
        name: [this.currentUser.name, Validators.required],
        age: [this.currentUser.age, [Validators.required, Validators.min(0)]],
        gender: [this.currentUser.gender, Validators.required],
        email: [this.currentUser.email, [Validators.required, Validators.email]],
        username: [this.currentUser.username, Validators.required],
        password: [this.currentUser.password, Validators.required],
        imgUser:[this.currentUser.imgUser]
      });

      /* Deteccion del rol */
      switch (this.currentUser.role) {
        case 'user':
          this.isUser = true;
          break;
        case 'admin':
          this.isAdmin = true;
          break;
      }
    }
  }

  onUpdatePersonalData(): void {
    if (this.personalDataForm.invalid) return;

    const updatedUser: User = {
      ...this.currentUser!,
      ...this.personalDataForm.value
    };

    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    this.currentUser = updatedUser;

    Swal.fire({
      icon: 'success',
      title: '¡Datos actualizados!',
      text: 'Tu información ha sido guardada correctamente.',
      confirmButtonText: 'Aceptar'
    })
  }

  onDeleteAccount(): void {
    alert('Logia para eliinar cuenta');
  }

  onResetChanges(): void {
    const userData = localStorage.getItem('currentUser');
    const userParsed = userData ? JSON.parse(userData) : null;

    if (userParsed) {
      this.currentUser = userParsed;
      this.personalDataForm.reset({
        name: this.currentUser?.name,
        age: this.currentUser?.age,
        gender: this.currentUser?.gender,
        email: this.currentUser?.email,
        username: this.currentUser?.username,
        password: this.currentUser?.password,
        imgUser: this.currentUser?.imgUser
      });

      Swal.fire({
        icon: 'info',
        title: 'Cambios descartados',
        text: 'Se restauraron tus datos previos.',
        confirmButtonText:'Entendido'
      });
    }
  }

}
