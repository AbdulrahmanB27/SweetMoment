import { useState } from 'react';
import { useLocation } from 'wouter';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Eye, EyeOff } from 'lucide-react';

// Form schema
const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function AdminLogin() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  async function onSubmit(data: LoginFormValues) {
    setIsLoading(true);

    try {
      // Make a real API call to authenticate with our backend
      const response = await apiRequest('/api/admin/login', 'POST', data);
      
      // Store the token in localStorage
      localStorage.setItem('adminToken', response.token);
      localStorage.setItem('adminUser', JSON.stringify(response.user));
      localStorage.setItem('adminLoggedIn', 'true');
      
      toast({
        title: "Login successful",
        description: "Welcome to the admin panel",
      });
      
      navigate('/admin');
    } catch (error) {
      console.error('Login failed:', error);
      toast({
        title: "Login failed",
        description: "Invalid username or password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Admin Login</h1>
          <p className="mt-2 text-gray-600">
            Enter your credentials to access the admin panel
          </p>
        </div>

        <div className="mt-8 bg-white py-8 px-4 shadow-xl rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <div className="mt-1">
                <input
                  id="username"
                  type="text"
                  required
                  className="w-full rounded border border-gray-300 px-3 py-2 shadow-sm focus:border-brown-500 focus:outline-none focus:ring-1 focus:ring-brown-500"
                  {...form.register('username')}
                />
                {form.formState.errors.username && (
                  <p className="mt-1 text-sm text-red-600">{form.formState.errors.username.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className="w-full rounded border border-gray-300 px-3 py-2 shadow-sm focus:border-brown-500 focus:outline-none focus:ring-1 focus:ring-brown-500"
                  {...form.register('password')}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center focus:outline-none"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <div className="relative h-5 w-5">
                    {showPassword ? (
                      <EyeOff 
                        className="absolute inset-0 h-5 w-5 text-gray-500 transition-all duration-300 transform hover:scale-110 animate-in fade-in rotate-in" 
                      />
                    ) : (
                      <Eye 
                        className="absolute inset-0 h-5 w-5 text-gray-500 transition-all duration-300 transform hover:scale-110 animate-in fade-in rotate-in"
                      />
                    )}
                  </div>
                </button>
                {form.formState.errors.password && (
                  <p className="mt-1 text-sm text-red-600">{form.formState.errors.password.message}</p>
                )}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#6F4E37] hover:bg-[#5a3f2c] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brown-500 disabled:opacity-50"
              >
                {isLoading ? 'Logging in...' : 'Sign in'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}