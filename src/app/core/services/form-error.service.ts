/* form-error.service.ts */
import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Role } from '../../core/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class FormErrorService {

  constructor() { }

  getErrors( form: FormGroup, entity: 'brand' | 'category' | 'product' | 'user' ) {
    const errors: Record< string, string > ={};

    if ( !form ) return errors;

    switch( entity ) {

      case 'brand':
        if ( !form.get('name')?.value?.trim() ) errors['name'] = 'Brand name is required' ; /* ?.trim() */
        if ( !form.get('logo')?.value?.trim() ) errors['logo'] = 'Brand logo is required' ; /* ?.trim() */
        break;
      
      case 'category':
        if ( !form.get('name')?.value?.trim() ) errors['name'] = 'Category name is required' ;  /* ?.trim() */
        if ( !form.get('description')?.value?.trim() ) errors['description'] = 'Category description is required' ; /* ?.trim() */
        if ( !form.get('imageURL')?.value?.trim() ) errors['imageURL'] = 'Category image URL is required' ; /* ?.trim() */
        break;

      case 'product':
        if ( !form.get( 'name' )?.value?.trim() ) errors[ 'name' ] = 'Product name is required' ; /* ?.trim() */
        if ( !form.get( 'imageURL' )?.value?.trim() ) errors[ 'imageURL' ] = 'Product image URL is required' ;
        if ( !form.get( 'brand' )?.value ) errors[ 'brand' ] = 'Brand is required' ;
        if ( !form.get( 'model' )?.value?.trim() ) errors[ 'model' ] = 'Model is required' ; /* ?.trim() */
        if ( !form.get( 'description' )?.value?.trim() ) errors[ 'description' ] = 'Description is required' ; /* ?.trim() */
        if ( !form.get( 'category' )?.value ) errors[ 'category' ] = 'Category is required' ;
        if ( !form.get( 'capacity' )?.value ) errors[ 'capacity' ] = 'Capacity is required' ;
        if ( !form.get( 'speed' )?.value ) errors[ 'speed' ] = 'Speed is required' ;
        if ( !form.get( 'sku' )?.value?.trim() ) errors[ 'sku' ] = 'SKU is required' ; /* ?.trim() */
        if ( form.get( 'price' )?.value == null ) errors[ 'price' ] = 'Price is required' ;
        if ( form.get( 'priceAdjustment' )?.value == null ) errors[ 'priceAdjustment' ] = 'Price adjustment is required' ;
        if ( form.get( 'discountPercentage' )?.value == null ) errors[ 'discountPercentage' ] = 'Discount percentage is required' ;
        if ( form.get( 'quantity' )?.value == null ) errors[ 'quantity' ] = 'Quantity is required' ;
        if ( form.get( 'available' )?.value == null ) errors[ 'available' ] = 'Available is required' ;
        break;

      case 'user':
        if ( !form.get( 'name' )?.value?.trim() ) errors[ 'name' ] = 'Name is required' ; /* ?.trim() */
        if ( form.get( 'age' )?.value == null ) errors[ 'age' ] = 'Age is required' ;        
        if ( !form.get( 'sex' )?.value ) errors[ 'sex' ] = 'Sex is required' ;
        if ( !form.get( 'phone' )?.value?.trim() ) errors[ 'phone' ] = 'Phone is required' ; /* ?.trim() */
        if ( !form.get( 'email' )?.value?.trim() ) errors[ 'email' ] = 'Email is required' ; /* ?.trim() */
        if ( !form.get( 'userName' )?.value?.trim() ) errors[ 'userName' ] = 'Username is required' ; /* ?.trim() */

        const roleValue = form.get('role')?.value;
        if ( !roleValue || !Object.values(Role).includes(roleValue as Role) ) errors[ 'role' ] = 'Role is invalid' ;

        if ( form.get( 'isActive' )?.value == null ) errors[ 'isActive' ] = 'Active status is required' ;

        break;
    }

    return errors;
  }

}
