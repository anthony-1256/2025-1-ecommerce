/***** src/app/pages/forms/form-adminreg/form-adminreg.component.ts *****/

import { Component, EventEmitter, Output } from '@angular/core';
import { User } from '../../../core/models/user.model';
import { Gender, Role } from '../../../core/types/enums';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-form-adminreg',
  standalone: true,
  imports: [ CommonModule, ReactiveFormsModule, FormsModule ],
  templateUrl: './form-adminreg.component.html',
  styleUrl: './form-adminreg.component.css'
})
export class FormAdminregComponent {

  /* ob: emisor del usuario cuando se registra */
  @Output() userRegistered = new EventEmitter<User>();

  /* ar: errores de validacion */
  errors: string[] = [];

  /* ar: lista de usuarios existentes */
  users: User[] =[];

  /* ob: enumeración para género */
  gender = Gender;

  /* ob: formulario reactivo para registrar usuario*/
  form: FormGroup;

  /* objetos de control de estado tocado de los inputs */
  imgUserTouched: boolean = false;
  nameTouched: boolean = false;
  ageTouched: boolean = false;
  genderTouched: boolean = false;
  emailTouched: boolean = false;
  usernameTouched: boolean = false;
  passwordTouched: boolean = false;

  // ob: vista previa de imagen seleccionada
  imagePreview: string | null = null;

  constructor (
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
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  /* ob: control de visibilidad de contraseña */
  passwordVisible: boolean = false;

  /* mt: ngOnInit - inicialización del componente */
  ngOnInit(): void {

    /* obtener usuarios registrados para calcular proximo id */
    const storedUsers = this.authService.getAllUsers();

    if (storedUsers && Array.isArray(storedUsers)) {
      this.users = storedUsers;      
    } else {
      this.users = [];
    }
  }

  
  /* fn: genera un idUser único basado en los existentes */
  generateUserId(): number {
    const existingIds = this.users.map(user => user.idUser).sort((a, b) => a - b);
    let newId = 1;

    for (let i = 0; i < existingIds.length; i++) {
      if (existingIds[i] === newId) {
        newId++;
      } else if (existingIds[i] > newId) {

        /* cn: se encontró el primer hueco libre */
        break; 
      }      
    }

    return newId;    
  }

  /* mt: admin registra nuevo usuario */
  adminRegisterUser(): void {

    /* Validar formulario antes de continuar */
    if (this.form.invalid) {
      this.errors.push('Completar todos los campos requeridos.');
      return;
    }

    /* ob: extraer datos del formulario */
    const adminFormData = this.form.value;

    /* ob: obtener contraseña */
    const password = this.form.get('password')?.value;

    if (!password || password.trim() === '') {
      this.errors.push('Falta la contraseña.');
      return;
    }

    /* DEBUG: verificar usuarios antes de generar ID */    
    const newId = this.generateUserId();    

    /* ob: crear nuevo usuario desde panel de admin */
    const newUser: User = {

      idUser: newId,
      /*
      ✅ Generador de ID único, reemplaza a 
        idUser: this.users.length + 1,
      */      
      imgUser: adminFormData.imgUser || '',
      name: adminFormData.name,
      age: adminFormData.age,
      gender: adminFormData.gender,
      email: adminFormData.email,
      username: adminFormData.username,
      password: adminFormData.password,
      admin: false,
      role: Role.user,
    };

    /* mt: registrar usuario en el servicio */
    this.authService.register(newUser);

    /* mt: emitir nuevo usuario registrado hacia el componente padre */
    this.userRegistered.emit(newUser);

    /* limpiar errores prvios y formulario */
    this.errors = [];
    this.resetForm();

    /* mt: mostrar alerta de registro exitoso */
    Swal.fire({
      icon: 'success',
      title: '¡Usuario registrado.!',
      text: 'Cuenta creada con exito',
      confirmButtonText: 'Aceptar'
    }).then(() => {


      /* Redirigir a ruta de panel de administracion de usuarios */
      /* this.router.navigate(['/usuarios']); */

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
    this.imagePreview = null;
  }

  /* mt: confirmar cancelacion del formulario */
  confirmCancel(): void {
    /* cn: verificacion de cambios sin guardar */
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

      /* cn: limpiar formulario si es confirm */
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

  /* mt: verificar si el formulario está listo para enviar */
  isFormReady(): boolean {
    return this.form.valid && Object.keys(this.form.controls).every(key => {
      const control = this.form.get(key);
      return control?.touched;
    });
  }

  /********************/

  /* mt: mostrar alertas con sweetalert */
  showAlert( type: 'success' | 'error', message: string): void {
    Swal.fire({
      icon: type,
      title: 'Aviso',
      text: message,
      showConfirmButton: true
    });
  }

  /* mt: manejo de imagen seleccionada */
  onImageSelected( event: any ): void {

    /* ob: input y archivo seleccionado */
    const input = event.target as HTMLInputElement;
    const file = input?.files?.[0];

    if (!file) {

      /* mt: actualizacion del formGroup */
      this.form.get('imgUser')?.markAllAsTouched();
      this.form.get('imgUser')?.setErrors({required: true});
      this.form.get('imgUser')?.updateValueAndValidity();;
      this.showAlert('error', 'Seleccionar una imagen de usuario.');
      return;
    }

    /* ar: tipos de archivo validos */
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];

    /* fn: validación de tipo de archivo */
    if (!validTypes.includes(file.type)) {
      this.showAlert('error', 'Solo se permiten imágenes con formato JPG, JPEG, PNG o WEBP.');
      return;
    }

    /* ob: lector de archivos */
    const reader = new  FileReader();

    /* fn: lectura esxitosa de archivo */
    reader.onload = (e: any) => {

      /* ob: resultado base64 */
      const base64 = e.target.result;

      this.imagePreview = base64; /* vista previa */

      /* mt: actualización del formGroup */
      this.form.get('imgUser')?.setValue(base64);
      this.form.get('imgUser')?.markAsTouched();
      this.form.get('imgUser')?.setErrors(null);
      this.form.get('imgUser')?.updateValueAndValidity();
    };

    /* fn: manejo de errores al leer el archivo */
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

}