import { Component, computed, effect, inject, input, numberAttribute, untracked } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HasUnsavedChanges } from '../../guards/has-unsaved-change-guard';
import { ProductService } from '../../services/product-service';

@Component({
  selector: 'app-product-form-page',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './product-form-page.html',
})
// Un seul formulaire pour deux routes :
//  - /catalogue/new       => pas d'id => création
//  - /catalogue/:id/edit  => id reçu en input => modification
export class ProductFormPage implements HasUnsavedChanges {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private productService = inject(ProductService);

  // optionnel : absent de l'URL /catalogue/new
  id = input<number | undefined, unknown>(undefined, { transform: numberAttribute });

  isEdit = computed(() => this.id() !== undefined);
  categories = ['Informatique', 'Audio'];

  form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    price: [0, [Validators.required, Validators.min(0)]],
    stock: [0, [Validators.required, Validators.min(0)]],
    category: ['Informatique', Validators.required],
    imageUrl: ['', Validators.required],
  });

  constructor() {
    // Remplit le formulaire avec le produit à modifier.
    // reset(valeurs) remet aussi le formulaire à "pristine" (aucun changement)
    effect(() => {
      const id = this.id();
      if (id === undefined) return;

      const product = untracked(() => this.productService.getById(id));
      if (product) {
        this.form.reset({
          name: product.name,
          price: product.price,
          stock: product.stock,
          category: product.category,
          imageUrl: product.imageUrl,
        });
      }
    });
  }

  // utilisé par unsavedChangesGuard (canDeactivate)
  hasChanges(): boolean {
    return this.form.dirty;
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const id = this.id();
    let savedId: number;

    if (id !== undefined) {
      this.productService.update(id, value);
      savedId = id;
    } else {
      savedId = this.productService.add(value).id;
    }

    // sans ça, le guard canDeactivate nous demanderait confirmation en quittant la page
    this.form.markAsPristine();
    this.router.navigate(['/catalogue', savedId]);
  }
}