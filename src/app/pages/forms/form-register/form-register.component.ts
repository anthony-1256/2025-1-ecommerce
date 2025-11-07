/***** src/app/pages/forms/form-register/form-register.component.ts *****/

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Gender, Role } from '../../../core/types/enums';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-form-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form-register.component.html',
  styleUrls: ['./form-register.component.css'],
})
export class FormRegisterComponent {
  
  /* ar: errores de validación */
  errors: string[] = [];

  /* ar: lista de usuarios existentes */
  users: User[] = [];  
  
  /* ob: enumeracion para género */
  gender = Gender;
  
  /* ob: confirmación de contraseña */
  confirmPassword: string = '';

  /* ob: formulario reactivo para registrar usuario */
  form: FormGroup;
  
  /* objetos de control de estado tocado de los inputs */
  imgUserTouched: boolean = false;
  nameTouched: boolean = false;
  ageTouched: boolean = false;
  genderTouched: boolean = false;
  emailTouched: boolean = false;
  usernameTouched: boolean = false;
  passwordTouched: boolean = false;
  confirmPasswordTouched: boolean = false;
  
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    /* ob: formulario reactivo para registrar usuario */
    this.form = this.fb.group({
      imgUser: ['', [Validators.required]],
      name: ['', [Validators.required, Validators.minLength(3)]],
      age: ['', [Validators.required, Validators.min(18)]],
      gender: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      username: ['', [Validators.required, Validators.minLength(8)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
    });
  }

  /* ob: control de visibilidad de contraseña */
  passwordVisible: boolean = false;
  confirmPasswordVisible: boolean = false;
  
  /* mt: ngOnInit - inicializacion del componente */
  ngOnInit(): void {
    
    /* obtener usuarios registrados para calcular el proximo id */
    const storedUsers = this.authService.getAllUsers();
    
    if (storedUsers && Array.isArray(storedUsers)) {
      this.users = storedUsers;
    } else {
      this.users = [];
    }
  }

  /* fn: obtener primer ID disponible */
  getNextAvailableId(): number {
    const ids = this.users.map(user => user.idUser).sort((a, b) => a - b);
    let id = 1;
    for (let i = 0; i < ids.length; i++) {
      if (ids[i] !== id) break;
      id++;
    }
    return id;
  }  
  
  /* mt: registrar nuevo usuario */
  registerUser(): void {
    
    /* Validacar formulario antes de continuar */
    if (this.form.invalid) {
      this.errors.push('Por favor completa todos los campos correctamente.');
      return;
    }

    /* ob: extraer datos del formulario */
    const userFormData = this.form.value;    

    /* ob: obtener y comparar contraseñas */
    const password = this.form.get('password')?.value;
    const confirmPassword = this.form.get('confirmPassword')?.value;

    if (password !== confirmPassword) {
      this.errors.push('Las contraseñas no coinciden.');
      return;
    }

    /* ob: crear nuevo usuario */
    const newUser: User = {
      idUser: this.getNextAvailableId(),
      imgUser: userFormData.imgUser || '',
      name: userFormData.name,
      age: userFormData.age,
      gender: userFormData.gender,
      email: userFormData.email,
      username: userFormData.username,
      password: userFormData.password,
      admin: false,
      role: Role.user,
    };
    
    /* mt: registrar usuario en el servicio */
    this.authService.register(newUser);
    
    /* Limpiar errores previos y formulario */
    this.errors = [];
    this.resetForm();

    /* mt: mostrar alerta de registro exitoso */
    Swal.fire({
      icon:'success',
      title: '¡Usuario registrado.!',
      text: 'Cuenta creada con exito.',
      confirmButtonText: 'Aceptar'      
    }).then(() => {

      /* Redirigir a una ruta de login*/
      this.router.navigate(['/inicioSesion']);
    });
  }  
  
  /* mt: confirmar cancelación del formulario */
  confirmCancel(): void {
    /* cn: verificar si hay cambios sin guardar */
    if (!this.form.dirty) return;
    
    /* mt: alerta de confirmación */
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Si cancelas, los datos del formulario se perderán.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'No, volver'
    }).then(result => {
      
      /* cn: limpiar formulario si se confirma */
      if (result.isConfirmed) {
        this.resetForm();
        
        /* mt: alerta de cancelación exitosa */
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
    this.form.reset();
    this.imgUserTouched = false;
    this.nameTouched = false;
    this.ageTouched = false;
    this.genderTouched = false;
    this.emailTouched = false;
    this.usernameTouched = false;
    this.passwordTouched = false;
    this.confirmPasswordTouched = false;
  }
  
  /* mt: verificar si el formulario está listo para enviar */
  isFormReady(): boolean {
    return this.form.valid && Object.keys(this.form.controls).every(key => {
      const control = this.form.get(key);
      return control?.touched;
    });
  }  

  /********************/  

  /* mt: mostrar alertas con sweetAlert */
  showAlert(type: 'success' | 'error', message: string): void {
    Swal.fire({
      icon: type,
      title: 'Aviso',
      text: message,      
      showConfirmButton: true
    });
  }

  /* mt: manejo de imagen seleccionada */
  onImageSelected(event: any): void {

    /* ob: input y archivo seleccionado */
    const input = event.target as HTMLInputElement;
    const file = input?.files?.[0];

    if (!file) {

      /* mt: actualización del FormGroup */
      this.form.get('imgUser')?.markAsTouched();
      this.form.get('imgUser')?.setErrors({required: true});
      this.form.get('imgUser')?.updateValueAndValidity();
      this.showAlert('error', 'Debes seleccionar una imagen de usuario.');
      return;
    }

    /* ar: tipos de archivo válidos */
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];

    /* fn: validación del tipo de archivo */
    if (!validTypes.includes(file.type)) {
      this.showAlert('error', 'Solo se permiten imágenes en formato JPG, JPEG, PNG o WEBP.');
      return;
    }

    /* ob: lector de archivos */
    const reader = new FileReader();

    /* fn: lectura exitosa de archivo */
    reader.onload = (e: any) => {

      /* ob: resultado base64 */
      const base64 = e.target.result;

      /* mt: actualización del FormGroup */
      this.form.get('imgUser')?.setValue(base64);
      this.form.get('imgUser')?.markAsTouched();
      this.form.get('imgUser')?.setErrors(null);
      this.form.get('imgUser')?.updateValueAndValidity();  
    };
    
    /* fn: manejo de errores al leer archivo */
    reader.onerror = () => {
      this.showAlert('error', 'Hubo un problema al leer la imagen. Intenta con otro archivo.');
    };
    
    /* fn: inicio de lectura */
    reader.readAsDataURL(file);
  }  

  /* mt: alternar visibilidad de contraseña principal */
  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
    const passwordInput = document.getElementById('password') as HTMLInputElement;
    if (passwordInput) {
      passwordInput.type = this.passwordVisible ? 'text' : 'password';
    }
  }

  /* mt: alternar visibilidad de confirmación de contraseña */
  togglePasswordVisibilityConfirm(): void {
    this.confirmPasswordVisible = !this.confirmPasswordVisible;
    const confirmPasswordInput = document.getElementById('confirmPassword') as HTMLInputElement;
    if (confirmPasswordInput) {
      confirmPasswordInput.type = this.confirmPasswordVisible ? 'text' : 'password';
    }
  }
}