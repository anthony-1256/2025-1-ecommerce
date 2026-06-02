/* auth.guard.ts */ /* <-- ajuste pc#0003 */
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
    const authService = inject( AuthService );
    const router = inject( Router );

    const user = authService.getCurrentUser();

    if ( user ) return true;

    router.navigate([ '/inicioSesion' ]);
    return false;
}; /* end authGuard */

export const adminGuard: CanActivateFn = () => {
    const authService = inject( AuthService );
    const router = inject( Router );

    const user = authService.getCurrentUser();

    if ( user?.role === 'admin' ) return true;

    router.navigate([ '/inicioSesion' ]);
    return false;
}; /* end adminGuard */