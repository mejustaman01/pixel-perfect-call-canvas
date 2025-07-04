
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const navigate = useNavigate();

  // Simulate authentication - in real app this would use Supabase
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSignUp) {
      // Store user data in localStorage for demo purposes
      localStorage.setItem('userData', JSON.stringify({
        name: formData.name,
        email: formData.email,
        isAuthenticated: true
      }));
    } else {
      // For sign in, just mark as authenticated
      const existingData = localStorage.getItem('userData');
      if (existingData) {
        const userData = JSON.parse(existingData);
        localStorage.setItem('userData', JSON.stringify({
          ...userData,
          isAuthenticated: true
        }));
      } else {
        // If no existing data, create with default name
        localStorage.setItem('userData', JSON.stringify({
          name: 'User',
          email: formData.email,
          isAuthenticated: true
        }));
      }
    }
    
    navigate('/dashboard');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-black mb-2">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p className="text-blue-600">
            {isSignUp ? 'Sign up to get started' : 'Sign in to your account'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {isSignUp && (
            <div className="space-y-2">
              <Label htmlFor="name" className="text-black">Full Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                required={isSignUp}
                value={formData.name}
                onChange={handleInputChange}
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                placeholder="Enter your full name"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-black">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleInputChange}
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              placeholder="Enter your email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-black">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleInputChange}
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              placeholder="Enter your password"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isSignUp ? 'Sign Up' : 'Sign In'}
          </Button>
        </form>

        <div className="text-center">
          <p className="text-black">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="ml-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
