/***** app.routes.ts *****/
import { Routes } from '@angular/router';
import { authGuard, adminGuard } from './core/guards/auth.guard';

export const routes: Routes = [

    {
        path: '',
        loadComponent: () =>
            import('./pages/general/home/home.component')
                .then(m => m.HomeComponent)
    },

    {
        path: 'addPayments',
        canActivate: [ authGuard ], /* <-- ajuste pc#0003 */
        loadComponent: () =>
            import('./pages/payments/form-addpayment/form-addpayment.component')
                .then(m => m.FormAddpaymentComponent),
        title: 'Agregar método de pago'
    },

    {
        path: 'address',
        canActivate: [ authGuard ], /* <-- ajuste pc#0003 */
        loadComponent: () =>
            import('./pages/addresses/address/address.component')
                .then(m => m.AddressComponent)
    },

    {
        path: 'best-sellers',
        canActivate: [ adminGuard ], /* <-- ajuste pc#0003 */
        loadComponent: () =>
            import('./pages/business/best-sellers/best-sellers.component')
                .then(m => m.BestSellersComponent),
        title: 'Historicos de ventas'
    },

    {
        path: 'bootstrap',
        loadComponent: () =>
            import('./pages/utilities/bootstrap-cheatsheet/bootstrap-cheatsheet.component')
                .then(m => m.BootstrapCheatsheetComponent),
        title: 'Bootstrap Cheatsheet'
    },

    {
        path: 'marcas', /* <-- ajuste pc#0004 */
        canActivate: [ adminGuard ],
        loadComponent: () =>
            import('./pages/products/brand/brand.component')
                .then(m => m.BrandComponent),
        title: 'Gestion de Marcas'
    },

    {
        path: 'carrito',
        canActivate: [ authGuard ], /* <-- ajuste pc#0003 */
        loadComponent: () =>
            import('./pages/purchases/cart/cart.component')
                .then(m => m.CartComponent),
        title: 'Carrito de compras'
    },

    {
        path: 'checkout',
        canActivate: [ authGuard ], /* <-- ajuste pc#0003 */
        loadComponent: () =>
            import('./pages/purchases/checkout/checkout.component')
                .then(m => m.CheckoutComponent),
        title: 'Checkout'
    },

    {
        path: 'compras',
        canActivate: [ authGuard ], /* <-- ajuste pc#0003 */
        loadComponent: () =>
            import('./pages/purchases/purchase/purchase.component')
                .then(m => m.PurchaseComponent),
        title: 'Compras'
    },

    {
        path: 'confirmacion',
        canActivate: [ authGuard ], /* <-- ajuste pc#0003 */
        loadComponent: () =>
            import('./pages/purchases/confirmation/confirmation.component')
                .then(m => m.ConfirmationComponent),
        title: 'Confirmación'
    },

    {
        path: 'detalles/:id',
        loadComponent: () =>
            import('./shared/components/card-view/card-view.component')
                .then(m => m.CardViewComponent)
    },

    {
        path: 'direcciones',
        canActivate: [ authGuard ], /* <-- ajuste pc#0003 */
        loadComponent: () =>
            import('./pages/addresses/address/address.component')
                .then(m => m.AddressComponent),
        title: 'Direcciones'
    },

    {
        path: 'wish-list',
        canActivate: [ authGuard ], /* <-- ajuste pc#0003 */
        loadComponent: () =>
            import('../app/pages/products/wish-list/wish-list.component')
                .then(m => m.WishListComponent),
        title: 'Favoritos'
    },

    {
        path: 'gestionOfertas',
        canActivate: [ adminGuard ], /* <-- ajuste pc#0003 */
        loadComponent: () =>
            import('../app/pages/business/offers/offers.component')
                .then(m => m.OffersComponent),
        title: 'Gestion de ofertas'
    },

    {
        path: 'inicioSesion',
        loadComponent: () =>
            import('./pages/auth/form-login/form-login.component')
                .then(m => m.FormLoginComponent),
        title: 'Inicio de sesión'
    },

    {
        path: 'inventario',
        canActivate: [ adminGuard ], /* <-- ajuste pc#0003 */
        loadComponent: () =>
            import('./pages/products/inventory/inventory.component')
                .then(m => m.InventoryComponent),
        title: 'Gestion de inventarios'
    },

    {
        path: 'ofertas',
        loadComponent: () =>
            import('./pages/general/home/home.component')
                .then(m => m.HomeComponent),
        title: 'Ofertas'
    },

    {
        path: 'pagos',
        canActivate: [ authGuard ], /* <-- ajuste pc#0003 */
        loadComponent: () =>
            import('./pages/payments/payment/payments.component')
                .then(m => m.PaymentsComponent),
        title: 'Pagos'
    },

    {
        path: 'perfilAdmin',
        canActivate: [ adminGuard ], /* <-- ajuste pc#0003 */
        loadComponent: () =>
            import('./pages/users/profiles/admin-profile/admin-profile.component')
                .then(m => m.AdminProfileComponent),
        title: 'Perfil administrador'
    },

    {
        path: 'perfilUsuario',
        canActivate: [ authGuard ], /* <-- ajuste pc#0003 */
        loadComponent: () =>
            import('./pages/users/profiles/profile/profile.component')
                .then(m => m.ProfileComponent),
        title: 'Perfil usuario'
    },

    {
        path: 'productos',
        loadComponent: () =>
            import('./pages/products/product-list/product-list.component')
                .then(m => m.ProductListComponent),
        title: 'Catálogo'
    },

    {
        path: 'purchase-history',
        canActivate: [ authGuard ], /* <-- ajuste pc#0003 */
        loadComponent: () =>
            import('./pages/users/purchase-history/purchase-history.component')
                .then(m => m.PurchaseHistoryComponent),
        title: 'Historial de compras'
    },

    {
        path: 'recibos',
        loadComponent: () =>
            import('./pages/purchases/confirmation/confirmation.component')
                .then(m => m.ConfirmationComponent),
        title: 'Recibos'
    },

    {
        path: 'registro',
        loadComponent: () =>
            import('./pages/auth/form-register/form-register.component')
                .then(m => m.FormRegisterComponent),
        title: 'Registro de usuario'
    },

    {
        path: 'registroAdmin',
        canActivate: [ adminGuard ], /* <-- ajuste pc#0003 */
        loadComponent: () =>
            import('./pages/auth/form-adminreg/form-adminreg.component')
                .then(m => m.FormAdminregComponent),
        title: 'Registro de nuevos usuarios'
    },

    {
        path: 'updateUser',
        canActivate: [ adminGuard ], /* <-- ajuste pc#0003 */
        loadComponent: () =>
            import('./pages/admin/update-user/update-user.component')
                .then(m => m.UpdateUserComponent),
        title: 'Actualizar usuario'
    },

    {
        path: 'usuarios',
        canActivate: [ adminGuard ], /* <-- ajuste pc#0003 */
        loadComponent: () =>
            import('./pages/admin/users/users.component')
                .then(m => m.UsersComponent),
        title: 'Gestion de usuarios'
    },

    {
        path: '**',
        loadComponent: () =>
            import('./pages/general/not-found/not-found.component')
                .then(m => m.NotFoundComponent),
        title: 'Página no encontrada'
    }

];