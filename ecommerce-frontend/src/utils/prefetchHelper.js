// filepath: c:\Users\Jetro\Documents\GitHub\TubesProwebA8\ecommerce-frontend\src\utils\prefetchHelper.js
/**
 * Helper utility for prefetching products to improve modal performance
 */
import { productService } from '../services/productService';

// Keep track of which products we've already prefetched
const prefetchedProducts = new Set();

/**
 * Prefetch a product for faster modal loading
 * 
 * @param {string|number} productId - ID of the product to prefetch
 * @returns {Promise<void>}
 */
export const prefetchProduct = async (productId) => {
  if (!productId || prefetchedProducts.has(productId)) {
    return;
  }
  
  try {
    prefetchedProducts.add(productId);
    await productService.prefetchProductDetails(productId);
  } catch (error) {
    console.error(`Error prefetching product ${productId}:`, error);
  }
};

/**
 * Prefetch visible products in a list (e.g., for products that are visible in the viewport)
 * 
 * @param {Array<Object>} products - List of product objects
 * @param {number} maxPrefetch - Maximum number of products to prefetch (default: 5)
 * @returns {Promise<void>}
 */
export const prefetchVisibleProducts = async (products, maxPrefetch = 5) => {
  if (!Array.isArray(products) || products.length === 0) {
    return;
  }
  
  try {
    // Take the first maxPrefetch products that haven't been prefetched yet
    const productsToPrefetch = products
      .filter(product => !prefetchedProducts.has(product.id))
      .slice(0, maxPrefetch)
      .map(product => product.id);
    
    if (productsToPrefetch.length === 0) {
      return;
    }
    
    // Mark all as prefetched to avoid duplicate requests
    productsToPrefetch.forEach(id => prefetchedProducts.add(id));
    
    // Use the bulk prefetch method
    await productService.prefetchMultipleProducts(productsToPrefetch);
  } catch (error) {
    console.error('Error prefetching visible products:', error);
  }
};

/**
 * Prefetch product on hover (useful for product cards)
 * Call this function in onMouseEnter events
 * 
 * @param {string|number} productId - ID of the product to prefetch
 */
export const prefetchProductOnHover = (productId) => {
  if (!productId || prefetchedProducts.has(productId)) {
    return;
  }
  
  // Just mark it as prefetched immediately to prevent multiple calls
  prefetchedProducts.add(productId);
  
  // Then do the actual prefetch
  setTimeout(() => {
    productService.prefetchProductDetails(productId)
      .catch(error => console.error(`Error prefetching product ${productId} on hover:`, error));
  }, 100);
};

export default {
  prefetchProduct,
  prefetchVisibleProducts,
  prefetchProductOnHover
};
