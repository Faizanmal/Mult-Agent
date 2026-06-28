"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Zap, CreditCard, ArrowUpRight } from 'lucide-react';
import { getStripe } from '@/lib/stripe';

export default function BillingSettingsPage() {
  const [isUpgrading, setIsUpgrading] = useState(false);

  // Mock data for demonstration
  const usagePercentage = 85;
  const usedTokens = '85,000';
  const totalTokens = '100,000';
  const currentPlan = 'Free';

  const handleUpgrade = async (priceId: string) => {
    setIsUpgrading(true);
    try {
      // In a real app, this would make an API call to your Django backend 
      // to create a Stripe Checkout Session, then use the session ID:
      
      /*
      const response = await fetch('/api/billing/create-checkout-session/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId })
      });
      const data = await response.json();
      
      const stripe = await getStripe();
      if (stripe) {
        await stripe.redirectToCheckout({ sessionId: data.sessionId });
      }
      */
      
      // Simulating a delay for the demo
      await new Promise(resolve => setTimeout(resolve, 1500));
      alert("Redirecting to Stripe Checkout for price: " + priceId);
    } catch (error) {
      console.error("Error creating checkout session:", error);
    } finally {
      setIsUpgrading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-5xl py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Billing & Usage</h1>
        <p className="text-muted-foreground mt-1">
          Manage your workspace subscription and monitor API usage.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mb-12">
        {/* Usage Quota Card */}
        <Card className="md:col-span-2 shadow-sm border-slate-200 dark:border-slate-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Current Billing Cycle Usage</CardTitle>
                <CardDescription>Resets on July 1st, 2026</CardDescription>
              </div>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800">
                {currentPlan} Plan
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-medium text-slate-700 dark:text-slate-300">API Requests & Tokens</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {usedTokens} <span className="text-muted-foreground font-normal">/ {totalTokens}</span>
              </span>
            </div>
            <Progress value={usagePercentage} className={`h-3 ${usagePercentage > 80 ? 'bg-red-100 dark:bg-red-950/50 [&>div]:bg-red-500' : ''}`} />
            
            {usagePercentage > 80 && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-md flex items-start gap-3">
                <Zap className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
                <div>
                  <h4 className="text-sm font-semibold text-red-800 dark:text-red-400">Approaching Limit</h4>
                  <p className="text-xs text-red-600/80 dark:text-red-400/80 mt-1">
                    You have used {usagePercentage}% of your monthly quota. Upgrade to Pro to ensure uninterrupted service for your agents.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Method Card */}
        <Card className="shadow-sm border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-xl">Payment Method</CardTitle>
            <CardDescription>Securely managed by Stripe</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-6 text-center">
            <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
              <CreditCard className="h-6 w-6 text-slate-400" />
            </div>
            <p className="text-sm text-muted-foreground mb-4">No payment method on file</p>
            <Button variant="outline" className="w-full">Add Payment Method</Button>
          </CardContent>
        </Card>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Upgrade Your Plan</h2>
        <p className="text-muted-foreground mt-1">
          Scale your multi-agent workflows with higher limits and advanced features.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Free Plan */}
        <Card className="border-slate-200 dark:border-slate-800 opacity-80">
          <CardHeader>
            <CardTitle>Free</CardTitle>
            <div className="text-3xl font-bold mt-2">$0<span className="text-sm text-muted-foreground font-normal">/month</span></div>
            <CardDescription className="pt-2">For individuals trying out the platform.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-slate-400" /> 1 Workspace</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-slate-400" /> Up to 3 Agents</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-slate-400" /> 100k Tokens / month</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-slate-400" /> Community Support</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" disabled>Current Plan</Button>
          </CardFooter>
        </Card>

        {/* Pro Plan */}
        <Card className="border-blue-500 shadow-md relative">
          <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2">
            <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 border-0">Recommended</Badge>
          </div>
          <CardHeader>
            <CardTitle>Pro</CardTitle>
            <div className="text-3xl font-bold mt-2">$49<span className="text-sm text-muted-foreground font-normal">/month</span></div>
            <CardDescription className="pt-2">For startups building production workflows.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-blue-500" /> Unlimited Workspaces</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-blue-500" /> Unlimited Agents</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-blue-500" /> 5M Tokens / month</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-blue-500" /> Priority Email Support</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-blue-500" /> Advanced Plugins Access</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              onClick={() => handleUpgrade('price_pro_123')}
              disabled={isUpgrading}
            >
              {isUpgrading ? 'Loading...' : 'Upgrade to Pro'}
            </Button>
          </CardFooter>
        </Card>

        {/* Enterprise Plan */}
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle>Enterprise</CardTitle>
            <div className="text-3xl font-bold mt-2">Custom</div>
            <CardDescription className="pt-2">For large-scale, custom infrastructure.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-slate-400" /> Dedicated Groq Instances</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-slate-400" /> Custom Model Fine-tuning</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-slate-400" /> Unlimited Tokens</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-slate-400" /> 24/7 Phone Support</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-slate-400" /> SLA Guarantee</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full flex items-center gap-2">
              Contact Sales <ArrowUpRight className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
