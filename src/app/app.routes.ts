/***** app.routes.ts *****/
import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { ProductListComponent } from './pages/product-list/product-list.component';
import { InventoryComponent } from './pages/inventory/inventory.component';
import { FormRegisterComponent } from './pages/forms/form-register/form-register.component';
import { FormLoginComponent } from './pages/forms/form-login/form-login.component';
import { CheckoutComponent } from './pages/checkout/checkout.component';
import { ConfirmationComponent } from './pages/confirmation/confirmation.component';
import { ProfileComponent } from './pages/profiles/profile/profile.component';
import { AdminProfileComponent } from './pages/profiles/admin-profile/admin-profile.component';
import { OffersComponent } from './pages/offers/offers.component';
import { UsersComponent } from './pages/users/users.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { FormAdminregComponent } from './pages/forms/form-adminreg/form-adminreg.component';
import { CartComponent } from './pages/cart/cart.component';
import { UpdateUserComponent } from './pages/forms/update-user/update-user.component';
import { FavoritesComponent } from './pages/favorites/favorites.component';
import { AddressComponent } from './pages/address/address.component';
import { FormAddaddressComponent } from './pages/forms/form-addaddress/form-addaddress.component';
import { BootstrapCheatsheetComponent } from './pages/bootstrap-cheatsheet/bootstrap-cheatsheet.component';
import { PaymentsComponent } from './pages/payments/payments.component';
import { FormAddpaymentComponent } from './pages/forms/form-addpayment/form-addpayment.component';
import { PurchaseComponent } from './pages/purchase/purchase.component';
import { PurchaseHistoryComponent } from './pages/purchase-history/purchase-history.component';
import { PricesComponent } from './pages/prices/prices.component';
import { BrandComponent } from './pages/brand/brand.component';
import { BestSellersComponent } from './pages/best-sellers/best-sellers.component';
import { CardViewComponent } from './pages/card-view/card-view.component';

export const routes: Routes = [

    { path: '', component: HomeComponent },

    { path: 'ofertas', component: HomeComponent, title: 'Ofertas' },

    { path: 'productos', component: ProductListComponent, title: 'Catálogo' },

    { path: 'detalles/:id', component: CardViewComponent },    

    { path: 'registroAdmin', component: FormAdminregComponent, title: 'Registro de nuevos usuarios'},
        
    { path: 'registro', component: FormRegisterComponent, title: 'Registro de usuario' },

    { path: 'inicioSesion', component: FormLoginComponent, title: 'Inicio de sesión' },
    
    { path: 'perfilUsuario', component: ProfileComponent },
    
    { path: 'perfilAdmin', component: AdminProfileComponent },

    { path: 'updateUser', component: UpdateUserComponent},

    { path: 'direcciones', component: AddressComponent},    

    { path: 'addAddress', component: FormAddaddressComponent},

    { path: 'pagos', component: PaymentsComponent},

    { path: 'addPayments', component: FormAddpaymentComponent },

    { path: 'compras', component: PurchaseComponent },

    { path: 'historial de compras', component: PurchaseHistoryComponent },

    { path: 'recibos', component: ConfirmationComponent },

    /*  */
    { path: 'bootstrap', component: BootstrapCheatsheetComponent},
    /*  */

    { path: 'marcas', component: BrandComponent, title: 'Gestion de Marcas' },

    { path: 'precios', component: PricesComponent, title: 'Gestion de Precios' },
    
    { path: 'inventario', component: InventoryComponent, title: 'Gestion de inventarios' },

    { path: 'gestionOfertas', component: OffersComponent, title: 'Gestion de ofertas'},

    { path: 'usuarios', component: UsersComponent, title: 'Gestion de usuarios' },

    { path: 'masVendidos', component: BestSellersComponent, title: 'Historicos de ventas' },

    { path: 'favoritos', component: FavoritesComponent},
    
    { path: 'carrito', component: CartComponent, title: 'Carrito de compras' },
    
    { path: 'checkout', component: CheckoutComponent, title: 'Checkout' },
    
    { path: 'confirmacion', component: ConfirmationComponent, title: 'Confirmación' },
    
    { path: '**', component: NotFoundComponent, title: 'Página no encontrada' }

];