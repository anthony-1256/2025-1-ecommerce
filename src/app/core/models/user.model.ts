/***** src/app/core/models/users.model.ts *****/
import { Gender, Role } from '../types/enums';

export interface User {

    idUser: number;
    imgUser: string;
    name: string;
    age: number;
    gender: Gender;    
    email: string;
    username: string;
    password: string;
    admin: boolean;    
    role: Role;

}