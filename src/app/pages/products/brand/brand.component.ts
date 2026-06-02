/* brand.component.ts */
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { Brand } from '../../../core/models/brand.model';
import { BrandService } from '../../../core/services/brand.service';

@Component({
  selector: 'app-brand',
  standalone: true,
  imports: [ CommonModule, FormsModule ],
  templateUrl: './brand.component.html',
  styleUrl: './brand.component.css'
})
export class BrandComponent {

  public newBrand: Omit<Brand, '_id'> = { name: '', logo: '' };
  public brands: Brand[] = [];
  
  constructor(private brandService: BrandService) {}
  
  ngOnInit(): void { /* <-- ajuste pc#0004 */
    this.brandService.brands$.subscribe(brands => {
      this.brands = brands;
    });

    this.brandService.getBrands().subscribe(); /* <-- ajuste pc#0004 */
  } /* end ngOnInit */
  
  getAllBrands(): Brand[] {
    return [...this.brands];
  } /* end getAllBrands */
  
  getBrandById(id: string): void {

    this.brandService
      .getBrandById(id)
      .subscribe();

  } /* end getBrandById */  
  
  addBrand(): void {
    if ( !this.newBrand.name.trim() || !this.newBrand.logo.trim() ) {
      Swal.fire( 'Error', 'Todos los campos son obligatorios', 'error' );
      return;
    }

    this.brandService.createBrand( this.newBrand ).subscribe({
      next: () => {
        this.newBrand = { name: '', logo: '' }; /* <-- ajuste pc#0004 — reset solo en next */
        Swal.fire( '¡Éxito!', 'Marca agregada correctamente', 'success' );
      },
      error: () => {
        Swal.fire( 'Error', 'No se pudo agregar la marca', 'error' ); /* <-- ajuste pc#0004 */
      }
    });
  } /* end addBrand */
  
onLogoFileSelected( event: Event ): void {
    const input = event.target as HTMLInputElement;
    if ( !input.files || input.files.length === 0 ) return;

    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      this.newBrand.logo = reader.result as string;
    };

    reader.readAsDataURL( file );
  } /* end onLogoFileSelected */

  updateBrandById( brand: Brand ): void {
    if ( !brand.name.trim() || !brand.logo.trim() ) {
      Swal.fire( 'Error', 'Todos los campos son obligatorios', 'error' );
      return;
    }

    this.brandService.updateBrand( brand ).subscribe({ /* <-- ajuste pc#0004 — subscribe agregado */
      next: () => {
        Swal.fire( 'Actualizado', 'Marca actualizada correctamente', 'success' );
      },
      error: () => {
        Swal.fire( 'Error', 'No se pudo actualizar la marca', 'error' ); /* <-- ajuste pc#0004 */
      }
    });
  } /* end updateBrandById */

  deleteBrandById( id: string ): void {
    if ( confirm( '¿Deseas eliminar esta marca?' ) ) {
      this.brandService.deleteBrand( id ).subscribe({
        next: () => {
          Swal.fire( 'Eliminado', 'Marca eliminada correctamente', 'success' );
        },
        error: () => {
          Swal.fire( 'Error', 'No se pudo eliminar la marca', 'error' ); /* <-- ajuste pc#0004 */
        }
      });
    }
  } /* end deleteBrandById */

} /* end BrandComponent */