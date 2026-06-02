/* users.component.ts */
import { Component, OnInit } from '@angular/core';
import { User } from '../../../core/models/user.model';
import { AuthService } from '../../../core/services/auth.service';
import { sex, Role } from '../../../core/types/enums';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { FormAdminregComponent } from '../../auth/form-adminreg/form-adminreg.component';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [ FormsModule, CommonModule, FormAdminregComponent ],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class UsersComponent implements OnInit {

  usersOriginal: User[] = [];
  users: User[] = [];
  newUser!: User;
  filteredUsers: User[] = [];
  private usersSubject = new BehaviorSubject<User[]>([]);
  public users$: Observable<User[]> = this.usersSubject.asObservable();

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUsers();
    this.filteredUsers = [...this.usersOriginal];
    this.newUser = this.createEmptyUser();
  } /* end ngOnInit */

  loadUsers(): void {
    this.usersOriginal = [...this.users];
    this.filteredUsers = [...this.users];
    this.usersSubject.next(this.users);
  } /* end loadUsers */

  createEmptyUser(): User {
    return {
      _id: crypto.randomUUID(),
      imgUser: '../../../../assets/images/default-user.png',
      name: '',
      age: 0,
      sex: sex.male,
      email: '',
      userName: '',
      role: Role.user,
      phone: '',
      isActive: true
    };
  } /* end createEmptyUser */

  toggleRole(user: User): void {
    if (user.userName === 'admin-master') return;
    user.role = user.role === Role.admin ? Role.user : Role.admin;
    this.updateUser(user);
    Swal.fire('¡Éxito!', `Rol cambiado a ${user.role}`, 'success');
  } /* end toggleRole */

  addUser(): void {
    if (
      this.newUser._id &&
      this.newUser.imgUser &&
      this.newUser.name &&
      this.newUser.age &&
      this.newUser.sex === sex.male &&
      this.newUser.email &&
      this.newUser.userName &&
      this.newUser.phone &&
      this.newUser.isActive
    ) {
      this.authService.register({
        name: this.newUser.name,
        email: this.newUser.email,
        password: '',
        phone: this.newUser.phone,
        userName: this.newUser.userName,
        age: this.newUser.age,
        sex: this.newUser.sex,
        imgUser: this.newUser.imgUser
      });

      this.newUser = this.createEmptyUser();
      Swal.fire('¡Éxito!', 'Usuario agregado correctamente', 'success');
    } else {
      Swal.fire('Error', 'Todos los campos son obligatorios', 'error');
    }
  } /* end addUser */

  onImageChange(user: User, event: Event): void {
    const input = event.target as HTMLInputElement;
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
  } /* end onImageChange */

  updateUser(user: User): void { /* <-- ajuste pc#00004 */
    const index = this.users.findIndex(u => u._id === user._id);
    if (index !== -1) {
      this.users[index] = user;
      this.usersOriginal = this.users.map(u => ({ ...u }));
      this.filteredUsers = [...this.users];
      this.usersSubject.next(this.filteredUsers);
    }
    Swal.fire('Actualizado', 'Usuario actualizado exitosamente', 'success');
  } /* end updateUser */

  deleteUser(userId: string): void { /* <-- ajuste pc#00004 */
    Swal.fire({
      title: '¿Eliminar usuario?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then(result => {
      if (result.isConfirmed) {
        this.users = this.users.filter(u => u._id !== userId);
        this.usersOriginal = this.users.map(u => ({ ...u }));
        this.filteredUsers = [...this.users];
        this.usersSubject.next(this.filteredUsers);
        Swal.fire('Eliminado', 'El usuario fue eliminado', 'success');
      }
    });
  } /* end deleteUser */

  filterBy(field: keyof User, event: Event): void { /* <-- ajuste pc#00004 */
    const value = (event.target as HTMLInputElement).value;
    this.filteredUsers = this.users.filter(user => {
      const fieldValue = user[field];
      return typeof fieldValue === 'string'
        ? fieldValue.toLowerCase().includes(value.toLowerCase())
        : fieldValue?.toString().toLowerCase().includes(value.toLowerCase());
    });
  } /* end filterBy */

  filterBysex(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const value = target.value;
    this.filteredUsers = this.users.filter(user => user.sex === value);
  } /* end filterBysex */

  goToRegister(): void {
    this.router.navigate(['/registro']);
  } /* end goToRegister */

  filterByAllFields(event: Event): void {
    const input = (event.target as HTMLInputElement).value.toLowerCase().trim();
    this.users = this.usersOriginal.filter(user =>
      Object.values(user).some(value =>
        (typeof value === 'string' || typeof value === 'number') &&
        value.toString().toLowerCase().includes(input)
      )
    );
  } /* end filterByAllFields */

  openAddUserModal(): void {
    const modalElement = document.getElementById('addUserModal');
    if (!modalElement) return;
    const modalInstance = (window as any).bootstrap.Modal.getOrCreateInstance(modalElement);
    modalInstance.show();
  } /* end openAddUserModal */

  onUserRegistered(newUser: { /* <-- ajuste pc#00004 */
    imgUser?: string;
    name: string;
    age: number;
    sex: string;
    email: string;
    userName: string;
    password: string;
    phone: string;
  }): void {
    const completeUser: User = {
      _id: crypto.randomUUID(),
      role: Role.user,
      isActive: true,
      imgUser: newUser.imgUser,
      name: newUser.name,
      age: newUser.age,
      sex: newUser.sex as 'male' | 'female',
      email: newUser.email,
      userName: newUser.userName,
      phone: newUser.phone
    };

    this.users.push(completeUser);
    this.filteredUsers = [...this.users];
    this.usersSubject.next(this.filteredUsers);

    Swal.fire({
      icon: 'success',
      title: '¡Usuario registrado!',
      text: 'Cuenta añadida correctamente',
      confirmButtonText: 'Ver lista'
    }).then(() => {
      this.router.navigate(['/usuarios']);
    });
  } /* end onUserRegistered */

} /* end UsersComponent */