import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { Brand } from '../../core/models/brand.model';
import { BrandService } from '../../core/services/brand.service';

@Component({
  selector: 'app-brand',
  standalone: true,
  imports: [ CommonModule, FormsModule ],
  templateUrl: './brand.component.html',
  styleUrl: './brand.component.css'
})
export class BrandComponent {

  public newBrand: Omit<Brand, 'idBrand'> = { name: '', logo: '' };
  public brands: Brand[] = [];
  
  constructor(private brandService: BrandService) {}
  
  ngOnInit(): void {
    // Suscripción reactiva para renderizar marcas en tiempo real
    this.brandService.brands$.subscribe(brands => {
      this.brands = brands;
    });  
  }

  /* mt: obtener todas las marcas */
  getAllBrands(): Brand[] {
    return [...this.brands];
  }

  /* mt: obtener marca por id */
  getBrandById(idBrand: number): Brand | undefined {
    return this.brandService.getBrandById(idBrand);
  }
  
  /* mt: agregar nueva marca con validación tipo touched */
  addBrand(): void {
    if (!this.newBrand.name.trim() || !this.newBrand.logo.trim()) {
      Swal.fire('Error', 'Todos los campos son obligatorios', 'error');
      return;
    }

    this.brandService.addBrand(this.newBrand);
    this.newBrand = { name: '', logo: '' };

    Swal.fire('¡Éxito!', 'Marca agregada correctamente', 'success');
  }

  /* mt: manejar archivo de logo seleccionado */
  onLogoFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      this.newBrand.logo = reader.result as string; // Guardamos base64 en logo
    };

    reader.readAsDataURL(file);
  }

  /* mt: actualizar marca con validación tipo touched */
  updateBrandById(brand: Brand): void {
    if (!brand.name.trim() || !brand.logo.trim()) {
      Swal.fire('Error', 'Todos los campos son obligatorios', 'error');
      return;
    }

    this.brandService.updateBrand(brand);
    Swal.fire('Actualizado', 'Marca actualizada correctamente', 'success');
  }

  /* mt: eliminar marca */
  deleteBrandById(idBrand: number): void {
    if (confirm('¿Deseas eliminar esta marca?')) {
      this.brandService.deleteBrand(idBrand);
      Swal.fire('Eliminado', 'Marca eliminada correctamente', 'success');
    }
  }
}