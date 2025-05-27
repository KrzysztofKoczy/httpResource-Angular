import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient, httpResource } from '@angular/common/http';
import { Product } from '../../models/product.interface';
import { RESOURCE_URL, SAMPLE_IMG } from '../../models/constants';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductListComponent {
  private http = inject(HttpClient)

  selectedCategory = signal('All');
  products =  httpResource<Product[]>(
    () => {
      const category = this.selectedCategory(); 

      if (category === 'All') {
        return RESOURCE_URL;
      }

      return `${RESOURCE_URL}?category=${category}`;
    }
  )

  deleteProduct(id: string, name: string): void {
    if (confirm(`Are you shure? You want do delete product: "${name}"?`)) {
      this.http.delete<void>(`${RESOURCE_URL}/${id}`)
        .subscribe({
          next: () => {
            console.log(`Product with ID ${id} deleted successfully.`);
          },
          error: (error) => {
            console.log(`Error deleting product with ID ${id}:`, error);
            alert(`Error deleting the product: "${name}".`);
          }
        });
    }
  }

  getStockClass(stock: number): string {
    if (stock > 10) return 'stock-high';
    if (stock > 0) return 'stock-medium';
    return 'stock-low';
  }

  onImageError(event: any): void {
    event.target.src = SAMPLE_IMG;
  }
}