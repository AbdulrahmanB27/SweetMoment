/**
 * useStaticDataQuery Hook
 * 
 * A hook that's similar to react-query's useQuery, but prioritizes static data
 * in static site mode. In dynamic mode, it falls back to the standard useQuery behavior.
 * 
 * This creates a seamless experience where the same code works in both static and dynamic modes.
 */

import { useQuery, type UseQueryOptions, type QueryKey, type UseQueryResult } from '@tanstack/react-query';
import { useStaticData, type StaticData } from '@/context/StaticDataContext';

/**
 * Helper to determine if we're in static site mode
 */
export const isStaticSite = (): boolean => {
  return typeof window !== 'undefined' && 
    (window.STATIC_SITE_MODE === true || window.location.pathname.includes('/static-site/'));
};

/**
 * Extracts a section of data from the static data store based on the API path
 */
function extractStaticData(staticData: any, path: string) {
  // Map API paths to static data structure
  if (path === '/api/site-customization') {
    return staticData.siteCustomization;
  } else if (path === '/api/products') {
    return staticData.products;
  } else if (path === '/api/categories') {
    return staticData.categories;
  } else if (path.match(/\/api\/products\/featured/)) {
    return staticData.featuredProducts;
  } else if (path.match(/\/api\/products\/(\d+)\/reviews/)) {
    const productId = path.match(/\/api\/products\/(\d+)\/reviews/)?.[1];
    if (productId && staticData.productReviews) {
      return staticData.productReviews[productId] || [];
    }
  } else {
    // Check if there's a direct key match in the static data
    if (staticData[path]) {
      return staticData[path];
    }
  }
  
  return null;
}

/**
 * Similar to useQuery but prioritizes static data in static mode
 */
export function useStaticDataQuery<TData = unknown, TError = unknown>(
  queryKey: QueryKey,
  options?: Omit<UseQueryOptions<TData, TError>, 'queryKey'>
): UseQueryResult<TData, TError> {
  // Get static data context
  const { isStatic, staticData } = useStaticData();
  
  // If we're in static mode and have static data, use it instead of fetching
  if (isStatic && staticData) {
    // Extract the API path from the query key (usually first element)
    const apiPath = typeof queryKey[0] === 'string' ? queryKey[0] : '';
    
    // Check if we have static data for this path
    const data = extractStaticData(staticData, apiPath);
    
    if (data !== null) {
      // Return a mock query result with the static data
      return {
        data: data as TData,
        isLoading: false,
        isError: false,
        error: null as TError,
        status: 'success',
        isSuccess: true,
        isFetching: false,
        isPending: false,
        isPlaceholderData: false,
        refetch: () => Promise.resolve({ data: data as TData, isError: false, error: null as TError, status: 'success', isSuccess: true }),
        remove: () => {},
        fetchStatus: 'idle',
      } as UseQueryResult<TData, TError>;
    }
  }
  
  // Otherwise, fall back to standard useQuery
  return useQuery<TData, TError>({ 
    queryKey,
    ...options
  });
}

/**
 * Hook for updating the static data cache (useful for the static site generator)
 */
export function useUpdateStaticData() {
  const { updateStaticData } = useStaticData();
  
  return {
    updateData: (path: string, data: any) => {
      updateStaticData(path, data);
    }
  };
}

/**
 * Hook for fetching site customization settings, handling both static and dynamic cases
 */
export function useSiteCustomization() {
  return useStaticDataQuery<any>(['/api/site-customization']);
}

/**
 * Hook for fetching products
 */
export function useProducts() {
  return useStaticDataQuery<any[]>(['/api/products']);
}

/**
 * Hook for fetching featured products
 */
export function useFeaturedProducts() {
  return useStaticDataQuery<any[]>(['/api/products/featured']);
}

/**
 * Hook for fetching product details
 */
export function useProduct(id: string | number) {
  return useStaticDataQuery<any>([`/api/products/${id}`]);
}

/**
 * Hook for fetching product reviews
 */
export function useProductReviews(productId: string | number) {
  return useStaticDataQuery<any[]>([`/api/products/${productId}/reviews`]);
}

/**
 * Hook for fetching categories
 */
export function useCategories() {
  return useStaticDataQuery<any[]>(['/api/categories']);
}

/**
 * Hook for fetching category details
 */
export function useCategory(slug: string) {
  return useStaticDataQuery<any>([`/api/categories/${slug}`]);
}