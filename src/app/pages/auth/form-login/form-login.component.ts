/* form-login.component.ts */
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { Role } from '../../../core/types/enums'; /* <-- ajuste pc#00004 */
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

  formLogin: FormGroup;
  passwordVisible: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.formLogin = this.fb.group({
      emailOrUsername: ['', [Validators.required, Validators.minLength(8)]], /* <-- ajuste pc#00004 */
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  } /* end togglePasswordVisibility */

  resetForm(): void {
    this.formLogin.reset();
  } /* end resetForm */

  onSubmit(): void { /* <-- ajuste pc#00004 */
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

    this.authService.login(emailOrUsername, password).subscribe({ /* <-- ajuste pc#00004 */
      next: () => {
        const user = this.authService.getCurrentUser();
        Swal.fire({
          icon: 'success',
          title: 'Bienvenido',
          text: `Hola ${user?.name}!`, /* <-- ajuste pc#00004 */
          showConfirmButton: true
        }).then(() => {
          if (user?.role === Role.admin) { /* <-- ajuste pc#00004 */
            this.router.navigate(['/perfilAdmin']);
          } else {
            this.router.navigate(['/perfilUsuario']);
          }
        });
      },
      error: () => {
        Swal.fire({
          icon: 'error',
          title: 'Error de inicio de sesión',
          text: 'Correo, usuario o contraseña incorrectos.'
        });
      }
    });
  } /* end onSubmit */

} /* end FormLoginComponent */