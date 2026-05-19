"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff, Loader2, Wallet } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import walletService from "@/lib/wallet/wallet-service";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'login' | 'signup';
  onSuccess: () => void;
  onAuthSuccess?: () => void;
}

export function AuthModal({ isOpen, onClose, type, onSuccess, onAuthSuccess }: AuthModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isWalletLoading, setIsWalletLoading] = useState(false);
  const { refreshUser } = useAuth();

  const handleWalletAuth = async (authType: 'login' | 'signup') => {
    setIsWalletLoading(true);

    try {
      let result;

      if (authType === 'signup') {
        // Register with wallet
        result = await walletService.registerWithWallet();
        toast.success('Welcome to BitPay! Registration successful.');
      } else {
        // Login with wallet
        result = await walletService.loginWithWallet();
        toast.success('Welcome back to BitPay!');
      }

      if (result.success) {
        // Refresh auth state from cookies
        await refreshUser();

        // Call auth success callback to refresh header
        if (onAuthSuccess) {
          onAuthSuccess();
        }

        onSuccess();
        onClose();

        // Navigate to dashboard after auth state is refreshed
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 100);
      } else {
        toast.error(result.error || 'Wallet authentication failed');
      }
    } catch (error: any) {
      console.error('Wallet authentication error:', error);
      toast.error(error.message || 'Failed to connect wallet');
    } finally {
      setIsWalletLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (type === 'signup') {
        if (formData.password !== formData.confirmPassword) {
          toast.error('Passwords do not match');
          setIsLoading(false);
          return;
        }

        if (formData.password.length < 8) {
          toast.error('Password must be at least 8 characters long');
          setIsLoading(false);
          return;
        }
      }

      const endpoint = type === 'login' ? '/api/auth/login' : '/api/auth/register';
      const payload = type === 'login' 
        ? { email: formData.email, password: formData.password }
        : { name: formData.name, email: formData.email, password: formData.password };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      const data = await response.json();

      if (response.ok) {
        toast.success(type === 'login' ? 'Welcome back to BitPay!' : 'BitPay account created successfully!');