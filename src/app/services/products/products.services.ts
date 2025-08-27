import { Injectable } from '@angular/core';
import { Product } from '../../shared/models/Product';

@Injectable({ providedIn: 'root' })
export class ProductServices {
  // If you're running on localhost, use json-server.
  // On GitHub Pages (or any static host), read from assets/db.json
  private readonly isLocal =
    location.hostname === 'localhost' || location.hostname === '127.0.0.1';

  private get productsURL() {
    return this.isLocal ? 'http://localhost:3000/products' : 'assets/db.json';
  }

  constructor() {}

  /** Load all products (array) from the correct source */
  private async loadAll(): Promise<Product[]> {
    const res = await fetch(this.productsURL);
    const data = await res.json();

    // json-server returns an array; assets/db.json returns { products: [...] }
    return Array.isArray(data) ? (data as Product[]) : (data?.products ?? []);
  }

  // ===== Public API (same signatures you had) =====

  /** Get all products */
  async getAllProducts(): Promise<Product[]> {
    return await this.loadAll();
  }

  /** Get one product by id */
  async getProductById(Id: number): Promise<Product | undefined> {
    const all = await this.loadAll();
    return all.find(p => Number((p as any).id) === Number(Id));
  }

  /** A "latest" product (simple: highest id) */
  async getLatestProduct(): Promise<Product | undefined> {
    const all = await this.loadAll();
    return all.sort((a: any, b: any) => Number(b.id) - Number(a.id))[0];
  }

  /** A basic "related" product by shared word in title (fallback: first different) */
  async getRelatedProduct(title: string): Promise<Product | undefined> {
    const all = await this.loadAll();
    const words = title.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    const related = all.find(p =>
      p.title.toLowerCase() !== title.toLowerCase() &&
      words.some(w => p.title.toLowerCase().includes(w))
    );
    return related ?? all.find(p => p.title.toLowerCase() !== title.toLowerCase());
  }
}
