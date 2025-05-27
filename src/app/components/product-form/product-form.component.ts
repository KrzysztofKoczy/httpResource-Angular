import { ChangeDetectionStrategy, Component, OnInit, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Product } from '../../models/product.interface';
import { HttpClient, httpResource } from '@angular/common/http';
import { RESOURCE_URL } from '../../models/constants';


@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductFormComponent implements OnInit {
  private router = inject(Router);
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private formBuilder = inject(FormBuilder);

  productForm: FormGroup;
  isEditMode = false;
  productId = signal<string>('');
  product = httpResource<Product[]>(
    () => {
      if (!this.productId()) {
        return '';
      }

      return `${RESOURCE_URL}?id=${this.productId()}`;
    },
    {
      defaultValue: []
    }
  );

  constructor() {
    this.productForm = this.createForm();

    effect(() => {
      const id = this.productId();
      const product = this.product.value()[0];

      if (product) {
        this.productForm.patchValue(product);
      }
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.productId.set(id);
    }
    
    this.isEditMode = !!this.productId();
  }

  
  submit(): void {
    if (this.productForm.valid) {
      const formData = this.productForm.getRawValue();

      formData.imageUrl = formData.imageUrl || 'assets/images/default-product.png';

      if (this.isEditMode && this.productId()) {
        this.http.put<Product>(`${RESOURCE_URL}/${this.productId()}`, formData)
          .subscribe({
            next: (updatedProduct) => {
              console.log('Product updated successfully:', updatedProduct);
              this.router.navigate(['/products', this.productId()]);
            },
            error: (error) => {
              console.log('ERROR updating product:', error);
            }
          });
      } else {
        delete formData.id;

        this.http.post<Product>(RESOURCE_URL, formData)
          .subscribe({
            next: (newProduct) => {
              this.router.navigate(['/products', newProduct.id]);
            },
            error: (error) => {
              console.log('Error creating product:', error);
            }
          });
      }
    } else {
      alert(`Wrong data`);
    }
  }

  goBack(): void {
    this.isEditMode ? this.router.navigate(['/products', this.productId()]) :  this.router.navigate(['/products']);
  }

  resetForm(): void {
    if (this.isEditMode) {
      const product = this.product.value()[0];
      
      if (product) {
        this.productForm.patchValue(product);
      }
      
    } else {
      this.productForm.reset({
        price: 0,
        stock: 0,
        imageUrl: ''
      });
    }
  }

  private createForm(): FormGroup {
    return this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      category: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0.01), Validators.max(10000)]],
      stock: [0, [Validators.required, Validators.min(0), Validators.max(10000)]],
      imageUrl: [''],
      description: ['', Validators.required]
    });
  }
}