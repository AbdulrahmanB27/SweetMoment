import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  url: string,
  method: string = 'GET',
  data?: unknown | undefined,
  options?: {
    parseJson?: boolean;
    headers?: Record<string, string>;
  }
): Promise<any> {
  const parseJson = options?.parseJson !== false; // Default to true
  const customHeaders = options?.headers || {};
  
  // Combine default headers with custom headers
  const headers: Record<string, string> = {
    ...(data ? { "Content-Type": "application/json" } : {}),
    ...customHeaders
  };

  // Add debug logging only in development
  const debugMethod = method.toUpperCase();
  const isDev = process.env.NODE_ENV !== 'production';
  
  if (isDev) {
    console.log(`API Request [${debugMethod}] ${url}`);
    console.log('Request headers:', headers);
    if (data) {
      console.log('Request body:', data);
    }
  }

  try {
    const res = await fetch(url, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });

    // Log the raw response status only in development
    if (isDev) {
      console.log(`API Response [${debugMethod}] ${url}: Status ${res.status} ${res.statusText}`);
      
      // Clone the response to read it twice (once for logging, once for the actual return)
      const resClone = res.clone();
      
      // Attempt to read and log the response body before processing it
      try {
        const debugText = await resClone.text();
        console.log(`API Response body:`, debugText ? debugText : "(empty body)");
      } catch (debugError) {
        console.log(`Could not read response body for debugging:`, debugError);
      }
    }
    
    // Now proceed with the original response handling
    await throwIfResNotOk(res);
    
    // Return the parsed JSON by default, or the raw response if parseJson is false
    const result = parseJson ? await res.json() : res;
    return result;
  } catch (error: any) {
    // Always log errors in development, but only critical errors in production
    if (isDev || (error?.message && typeof error.message === 'string' && error.message.includes('500'))) {
      console.error(`API Request [${debugMethod}] ${url} failed:`, error);
    }
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
