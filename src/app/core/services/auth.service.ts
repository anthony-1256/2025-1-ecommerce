/***** src/app/core/services/auth.service.ts *****/
import { Injectable } from '@angular/core';
import { User } from '../models/user.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { Gender, Role } from '../types/enums';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  /* ar: usuarios registrados */
  private users: User[] = [];

  /* ob: observable reactivo del listado de usuarios */
  private usersSubject = new BehaviorSubject<User[]>([]);
  public users$: Observable<User[]> = this.usersSubject.asObservable(); /* Exposición del observable para suscripción */

  /* ob: usuario actualmente logueado */
  private currentUser: User | null = null;

  /* ob: observable reactivo del usuario actual */
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();


  constructor( private router: Router ) {
    this.loadUsersFromLocalStorage();   /* mt: carga inicial de usuarios desde localStorage */
    this.loadCurrentUser();             /* mt: carga usuario logueado si existe */
  }
  

  /*************** Registro de Usuario ***************/
  
  /* fn: registrar un nuevo usuario */
  register(user: User): void {
    this.loadUsersFromLocalStorage();   /* asegura la última versión del array */

    /* fn: agregar nuevo Id único */
    const usedIds = this.users.map(u => u.idUser).sort((a, b) => a - b);
    let newId = 1;
    for (let i = 0; i <usedIds.length; i++) {
      if (usedIds[i] !== newId) break;
      newId++;    
    }
    user.idUser = newId;

    this.users.push(user);              /* agrega nuevo usuario */
    this.saveUsersToLocalStorage();     /* guarda en localStorage */
    this.usersSubject.next(this.users); /* 🔄 emite nueva lista reactiva */    
  }

  /*************** Funcionalidades para Login ***************/
  
  /* fn: iniciar sesión con correo o username indistintamente */
  login(emailOrUsername: string, password: string): User | null {
    const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');

    const userFound = storedUsers.find((user: any) => {
      return (
        (user.email === emailOrUsername || user.username === emailOrUsername) &&
        user.password === password
      );
    });

    if (userFound) {
      this.currentUser = userFound;
      this.saveCurrentUserToLocalStorage();
      this.currentUserSubject.next(this.currentUser);
      return userFound;
    }

    return null;
  }

  /* fn: cerrar sesión y limpiar localStorage */
  logout(): void {    
    this.currentUser = null;
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.router.navigate(['/inicioSesion']);
  }

  /*************** Funcionalidades de Usuarios ***************/
  
  /* fn: obtener todos los usuarios (no reactivo) */
  getAllUsers(): User[] {
    this.loadUsersFromLocalStorage();
    return this.users;
  }

  /* fn: buscar usuario por email */
  getUserByEmail(email: string): User | undefined {
    return this.users.find(user => user.email === email);
  }

  /* fn: buscar usuario por username */
  getUserByUsername(username: string): User | undefined {
    return this.users.find(user => user.username === username);
  }

  /* mt: obtener el usuario actualmente logueado */
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  /* mt: actualizar usuario existente por id */
  updateUser(updateUser: User): void {
    const index = this.users.findIndex(user => user.idUser === updateUser.idUser);
    if (index !== -1) {
      this.users[index] = { ...updateUser };
      this.saveUsersToLocalStorage();
      this.usersSubject.next(this.users);  // 🔄 emitir lista actualizada
    }
  }

  /* mt: eliminar usuario por ID, con protección para el admin-master */
  deleteUser(userId: number): void {
    const userToDelete = this.users.find(user => user.idUser === userId);
    if (userToDelete?.username === 'admin-master') {
      console.warn('⚠️ No se puede eliminar al superadministrador.');
      return;
    }

    this.users = this.users.filter(user => user.idUser !== userId);
    this.saveUsersToLocalStorage();
    this.usersSubject.next(this.users);  // 🔄 emitir lista actualizada
  }

  /* fn: generar un id único que no esté ya ocupado */
  generateUniqueUserId(): number {
  const usersFromStorage: User[] = JSON.parse(localStorage.getItem('users') || '[]');

  const usedIds = new Set(usersFromStorage.map(user => user.idUser));
  let candidateId = 1;

  while (usedIds.has(candidateId)) {
    candidateId++;
  }

  return candidateId;
}

  /*************** Manejo de LocalStorage ***************/
  /* mt: carga los usuarios desde localStorage, crea admin por defecto si no existe */
  private loadUsersFromLocalStorage(): void {
    const usersFromStorage = localStorage.getItem('users');
    this.users = usersFromStorage ? JSON.parse(usersFromStorage) : [];
    
    /* 🧽 Limpieza de duplicados del admin */
    const adminUsers = this.users.filter(user => user.username === 'admin-master');
    if (adminUsers.length > 1) {
      const firstAdmin = adminUsers[0];
      this.users = [
        firstAdmin,
        ...this.users.filter(user => user.username !== 'admin-master')
      ];
    }
    
    /* 🚫 Si no hay ningún admin, lo creamos */
    const adminExists = this.users.some(user => user.username === 'admin-master');
    if (!adminExists) {
      const adminUser: User = {
        idUser: 1,
        imgUser: '../../../../assets/images/logo-admin.jpg',
        name: 'Administrador del Sistema',
        age: 0,
        gender: Gender.other,
        email: 'admin-master@system.com',
        username: 'admin-master',
        password: 'admin_1234',
        admin: true,
        role: Role.admin
      };
      
      this.users.unshift(adminUser);
    }
    
    this.saveUsersToLocalStorage();
    this.usersSubject.next(this.users);  // 🔄 emitir lista actualizada
  }

  /* mt: guarda los usuarios en localStorage */
  private saveUsersToLocalStorage(): void {
    localStorage.setItem('users', JSON.stringify(this.users));
  }

  /* mt: carga el usuario logueado desde localStorage */
  private loadCurrentUser(): void {
    const currentUser = localStorage.getItem('currentUser');
    this.currentUser = currentUser ? JSON.parse(currentUser) : null;
    this.currentUserSubject.next(this.currentUser);
  }

  /* mt: guarda el usuario logueado en localStorage */
  private saveCurrentUserToLocalStorage(): void {
    if (this.currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
    }
  }
}
