import { productService } from '../../services/productService';

// Store for prefetched products
const prefetchedProducts = new Map();

// Function to prefetch products for better performance
export const prefetchProductForModal = async (id) => {
  if (!id || prefetchedProducts.has(id)) return;
  
  try {
    const data = await productService.getProductById(id);
    prefetchedProducts.set(id, data);
    
    // Also prefetch the product image
    if (data && data.image_url) {
      const img = new Image();
      img.src = data.image_url;
    }
  } catch (err) {
    console.error(`Failed to prefetch product ${id}:`, err);
  }
};

// Function to get prefetched product
export const getPrefetchedProduct = (id) => {
  return prefetchedProducts.get(id);
};

// Function to clear prefetched product
export const clearPrefetchedProduct = (id) => {
  prefetchedProducts.delete(id);
};
