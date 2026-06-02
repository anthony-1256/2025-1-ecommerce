/* user.model.ts */
import { z } from 'zod';

export interface User {
    _id: string;
    imgUser?: string;
    name: string;
    age: number;
    sex: 'male' | 'female';
    phone: string;
    email: string;
    userName: string;
    role: Role;
    isActive: boolean;
}

export enum Role {
    guest = 'guest',
    user = 'user',
    admin = 'admin'
}

export const userSchema = z.object({
    _id: z.string(),
    imgUser: z.string(),
    name: z.string(),
    age: z.number(),
    sex: z.enum(['male', 'female']),
    phone: z.string(),
    email: z.email(),
    userName: z.string(),
    role: z.enum(Role),
    isActive: z.boolean()
});