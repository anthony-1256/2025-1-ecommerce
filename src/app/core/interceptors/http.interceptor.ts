import { HttpInterceptorFn } from "@angular/common/http";
import { AuthService } from "../../../app/core/services/auth.service";
import { inject } from "@angular/core";

export const httpInterceptor: HttpInterceptorFn = ( req, next ) => {

    const authService = inject( AuthService );
    const token = authService.getToken();

    if ( token ) {
        const cloneReq = req.clone({
            setHeaders: {
                Authorization: `Bearer ${ token }`
            }
        });

        return next( cloneReq );
    }

    return next ( req );
};