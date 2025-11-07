/***** src/app/pages/users/users.component.ts *****/

import { Component, OnInit } from '@angular/core';
import { User } from '../../core/models/user.model';
import { AuthService } from '../../core/services/auth.service';
import { Gender, Role } from '../../core/types/enums';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormAdminregComponent } from '../forms/form-adminreg/form-adminreg.component';
import { BehaviorSubject, Observable } from 'rxjs';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [ FormsModule, CommonModule, FormAdminregComponent ],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class UsersComponent implements OnInit {

  /* ar: arreglo principal */
  usersOriginal: User[] = []; /* copia original para resetear búsqueda */

  /* ar: listado de usuarios */
  users: User[] = [];

  /* ob: nuevo usuario a agregar */
  newUser!: User; /* solo se declara sin inicializar aun */

  
  /* ob: copia de seguridad para filtros */
  filteredUsers: User[] = [];
  
  /* ----- INICIO: BehaviorSubject y Observable ----- */
  
  /* ob: listado reactivo de usuarios */
  private usersSubject = new BehaviorSubject<User[]>([]); /* Declaracion de Behavior subject */
  public users$: Observable<User[]> = this.usersSubject.asObservable(); /* Exposicion para suscripcion */
  
  /* ----- FINAL: BehaviorSubject y Observable ----- */
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}
  
  /* mt: carga inicial de usuarios */
  ngOnInit(): void {
    this.loadUsers(); /* mt: carga desde storage o servicio */
    
    /* renderiza en tiempo real */
    this.filteredUsers = [ ...this.usersOriginal];
    
    /* ob: nuevo usuario a agregar */
    this.newUser = this.createEmptyUser();
  }

  /* mt: carga los usuarios desde el servicio */
  loadUsers(): void {
    this.usersOriginal = this.authService.getAllUsers();
    this.users = [...this.usersOriginal];

    this.filteredUsers = [...this.usersOriginal]; /* 📌 actualiza lo que se renderiza */

    /* Actualizar el BehaviorSubject con la lista de usuarios */
    this.usersSubject.next(this.users); /* Actualización del observable con los usuarios más recientes */
  }

  /* mt: crea un usuario vacío */
  createEmptyUser(): User {
    return {
      idUser: this.authService.generateUniqueUserId(),
      imgUser: '../../../../assets/images/default-user.png',
      name: '',
      age: 0,
      gender: Gender.other,
      email: '',
      username: '',
      password: '',
      admin: false,
      role: Role.user
    };
  }

  /* fn: cambiar el rol de un usuario entre admin y user */
  toggleRole(user: User): void {
    if (user.username === 'admin-master') return;

    user.admin = !user.admin;
    user.role = user.admin ? Role.admin : Role.user;

    this.updateUser(user);

    Swal.fire('¡Éxito!', `Rol cambiado a ${user.role}`, 'success');
  }
  
  /* mt: registra nuevo usuario */
  addUser(): void {
    if (
      this.newUser.idUser &&
      this.newUser.imgUser &&
      this.newUser.name &&
      this.newUser.age &&
      this.newUser.gender === Gender.other &&
      this.newUser.email &&
      this.newUser.username &&
      this.newUser.password
    ) {
      this.authService.register({ ...this.newUser });
      
      this.newUser = this.createEmptyUser();

      Swal.fire('¡Exito!', 'Usuario agregado correctamente', 'success');
    } else {
      Swal.fire('Error', 'Todos los campos son obligatorios', 'error');
    }
  }

  /* mt: cambia imagen usuario desde input file */
  /* onImageChange(user: User, event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      user.imgUser = reader.result as string;      
      
      this.updateUser(user);
    };

    reader.readAsDataURL(file);
  } */

  /* mt: cambia imagen usuario desde input file */
  onImageChange(user: User, event: Event): void {
    const input = event.target as HTMLInputElement;

    /* cn: si no hay archivos seleccionados, salir */
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      const updatedUser: User = {
        ...user,
        imgUser: reader.result as string
      };

      this.updateUser(updatedUser);
    };

    reader.readAsDataURL(file);
  }


  /* mt: actualiza un usuario */
  updateUser(user: User): void {
    this.authService.updateUser(user);
    Swal.fire('Actualizado', 'Usuario actualizado exitosamente', 'success');
  }

  /* mt: elimina un usuario */
  deleteUser(userId: number): void {
    Swal.fire({
      title: '¿Eliminar usuario?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then(result => {
      if (result.isConfirmed) {
        this.authService.deleteUser(userId);
        this.loadUsers();
        Swal.fire('Eliminado', 'El usuario fue eliminado', 'success');
      }
    });
  }

  /* fn: filtro por campo (nombre de la propiedad y valor del input) */
  filterBy(field: keyof User, event: any): void {
    const value = event.target.value;
    this.filteredUsers = this.users.filter(user => {
      const fieldValue = user[field];
      return typeof fieldValue === 'string'
        ? fieldValue.toLowerCase().includes(value.toLowerCase())
        : fieldValue?.toString().toLowerCase().includes(value.toLowerCase());
    });
  }
  
  filterByGender(event: Event): void {
    const target = event.target as HTMLSelectElement; // Hacemos el cast a HTMLSelectElement
    const value = target.value;
    this.filteredUsers = this.users.filter(user => user.gender === value);
  }

  // mt Navegar al registro de usuarios
  goToRegister(): void {
    this.router.navigate(['/registro']);
  }

  /* fn: filtra usuarios por múltiples campos a la vez */
  filterByAllFields( event: Event ): void {
    const input = ( event.target as HTMLInputElement ).value.toLowerCase().trim();

    this.users = this.usersOriginal.filter(user =>
      Object.values(user).some(value =>
        (typeof value === 'string' || typeof value === 'number')&&
        value.toString().toLowerCase().includes(input)
      )
    );
  }

    // 📌 fn: Abrir modal para agregar usuario
  openAddUserModal(): void {
    const modalElement = document.getElementById('addUserModal');
    if (!modalElement) return;

    // cn: Acceder a Bootstrap desde el objeto global (window)
    const modalInstance = (window as any).bootstrap.Modal.getOrCreateInstance(modalElement);
    modalInstance.show();
  }

  /* mt: manejar usuario registrado desde el formulario admin */
  onUserRegistered(newUser: User): void {
    /* mt: añadir usuario a la lista local */
    this.users.push(newUser);
    this.filteredUsers = [...this.users];

    /* mt: emitir nueva lista reactiva */
    this.usersSubject.next(this.filteredUsers); // 👈 Esto actualiza automáticamente lo visible

    /* mt: mostrar alerta e ir al listado */
    Swal.fire({
      icon: 'success',
      title: '¡Usuario registrado!',
      text: 'Cuenta añadida correctamente',
      confirmButtonText: 'Ver lista'
    }).then(() => {
      this.router.navigate(['/usuarios']);
    });
  }
}
