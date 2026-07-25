"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Mail, Sparkles, ArrowLeft, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useAuth } from '@/contexts/AuthContext';

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: FormValues) => {
    setError(null);
    setIsLoading(true);
    try {
      const ok = await resetPassword(data.email);
      if (!ok) {
        setError('Could not send reset email. Please try again.');
        return;
      }
      setSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-background">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="relative h-10 w-10 flex items-center justify-center">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500" />
            <Sparkles className="relative h-5 w-5 text-white" />
          </div>
          <span className="text-2xl font-bold">MultiAgent AI</span>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">Reset password</h2>
          <p className="text-muted-foreground">
            Enter your email and we&apos;ll send a reset link if an account exists.
          </p>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {sent ? (
          <div className="rounded-xl border bg-muted/40 p-6 text-center space-y-4">
            <CheckCircle2 className="h-10 w-10 text-green-500 mx-auto" />
            <p className="font-medium">Check your email</p>
            <p className="text-sm text-muted-foreground">
              If an account exists for that address, a reset link is on its way.
            </p>
            <Button asChild variant="outline" className="w-full rounded-xl">
              <Link href="/login">Back to sign in</Link>
            </Button>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                          placeholder="name@company.com"
                          className="h-12 pl-10 rounded-xl"
                          autoComplete="email"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send reset link'
                )}
              </Button>
            </form>
          </Form>
        )}

        <p className="text-center mt-6">
          <Link href="/login" className="inline-flex items-center text-sm text-primary hover:underline">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
