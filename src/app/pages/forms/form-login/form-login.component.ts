/***** src/app/pages/forms/form-login/form-login.component.ts *****/
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  selector: 'app-form-login',
  standalone: true,
  imports: [ FormsModule, CommonModule, ReactiveFormsModule ],
  templateUrl: './form-login.component.html',
  styleUrls: ['./form-login.component.css']
})
export class FormLoginComponent {

  /* ob: formulario reactivo para login */
  formLogin: FormGroup;

  /* ob: bandera para mostrar u ocultar contraseña */
  passwordVisible: boolean = false;  

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    /* Inicialización del formulario */
    this.formLogin = this.fb.group({
      emailOrUsername: ['', Validators.required, Validators.minLength(8)], /* mt: campo obligatorio */
      password: ['', [Validators.required, Validators.minLength(8)]] /* mt: contraseña requerida con validación mínima */
    });
  }

  /*************** Métodos ****************/

  /* mt: alterna la visibilidad de la contraseña */
  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  /* mt: reseta formulario */
  resetForm(): void {
    this.formLogin.reset();
  }

  /* mt: maneja el submit del formulario */
  onSubmit(): void {
    if (this.formLogin.invalid) {
      Swal.fire({
        icon: 'error',
        title: 'Formulario incompleto',
        text: 'Por favor llena todos los campos correctamente.'
      });
      return;
    }
  
    const emailOrUsername = this.formLogin.value.emailOrUsername.trim();
    const password = this.formLogin.value.password;  
    const user = this.authService.login(emailOrUsername, password);
  
    if (user) {
      Swal.fire({
        icon: 'success',
        title: 'Bienvenido',
        text: `Hola ${user.username}!`,
        showConfirmButton: true
      }).then(() => {
        if (user.admin) {
          this.router.navigate(['/perfilAdmin']);
        } else {
          this.router.navigate(['/perfilUsuario']);
        }
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error de inicio de sesión',
        text: `Correo, usuario o contraseña incorrectos.`
      });
    }
  }
  
}