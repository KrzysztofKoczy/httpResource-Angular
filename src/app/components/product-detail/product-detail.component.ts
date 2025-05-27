import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient, httpResource } from '@angular/common/http';
import { Product } from '../../models/product.interface';
import { RESOURCE_URL, SAMPLE_IMG } from '../../models/constants';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductDetailComponent {
  private router = inject(Router);
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);

  productId = this.route.snapshot.paramMap.get('id')
  product = httpResource<Product[]>(
    () => `${RESOURCE_URL}?id=${this.productId}`,
    {
      defaultValue: []
    }
  );

  goBack(): void {
    this.router.navigate(['/products']);
  }

  deleteProduct(): void {
    const id = this.product.value()[0].id;
    const name = this.product.value()[0].name;

    if (confirm(`Are you sure you want to remove the product "${name}"?`)) {
      this.http.delete<void>(`${RESOURCE_URL}/${id}`)
        .subscribe({
          next: () => {
            console.log(`Product with ID ${id} deleted successfully.`);
            this.router.navigate(['/products']);
          },
          error: (error) => {
            console.error(`Error deleting product with ID ${id}:`, error);
            alert(`Error deleting the product: "${name}".`);
          }
        });
    }
  }

  getStockStatusClass(): string {
    const stock = this.product.value()[0].stock;

    if (stock > 10) return 'badge-success';
    if (stock > 0) return 'badge-warning';
    return 'badge-danger';
  }

  getStockStatusText(): string {
    const stock = this.product.value()[0].stock;

    if (stock > 10) return 'Dostępny';
    if (stock > 0) return 'Ostatnie sztuki';
    return 'Wyprzedany';
  }

  onImageError(event: any): void {
    event.target.src = SAMPLE_IMG;
  }
}