/**
 * SecureKeyManager.tsx
 * 
 * Frontend component for managing encrypted API keys and credentials
 * 
 * @author Mohamed Hossameldin Abdelaziz
 * @date October 22, 2025
 */

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

interface Credential {
  provider: string;
  keyName: string;
  metadata?: any;
  createdAt?: string;
}

export function SecureKeyManager() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [stats, setStats] = useState<any>(null);

  // Coinbase state
  const [coinbaseApiKey, setCoinbaseApiKey] = useState('');
  const [coinbaseWebhook, setCoinbaseWebhook] = useState('');

  // Sabre state
  const [sabreClientId, setSabreClientId] = useState('');
  const [sabreClientSecret, setSabreClientSecret] = useState('');
  const [sabrePcc, setSabrePcc] = useState('');

  // Stripe state
  const [stripeSecretKey, setStripeSecretKey] = useState('');
  const [stripePublishableKey, setStripePublishableKey] = useState('');
  const [stripeWebhook, setStripeWebhook] = useState('');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await fetch('/api/vault/stats');
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const storeCoinbaseCredentials = async () => {
    if (!coinbaseApiKey) {
      showMessage('error', 'API Key is required');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/vault/coinbase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: coinbaseApiKey,
          webhookSecret: coinbaseWebhook || undefined
        })
      });

      const data = await response.json();

      if (data.success) {
        showMessage('success', 'Coinbase credentials stored successfully');
        setCoinbaseApiKey('');
        setCoinbaseWebhook('');
        loadStats();
      } else {
        showMessage('error', data.error);
      }
    } catch (error) {
      showMessage('error', 'Failed to store credentials');
    } finally {
      setLoading(false);
    }
  };

  const storeSabreCredentials = async () => {
    if (!sabreClientId || !sabreClientSecret) {
      showMessage('error', 'Client ID and Secret are required');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/vault/sabre', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: sabreClientId,
          clientSecret: sabreClientSecret,
          pcc: sabrePcc || undefined
        })
      });

      const data = await response.json();

      if (data.success) {
        showMessage('success', 'Sabre credentials stored successfully');
        setSabreClientId('');
        setSabreClientSecret('');
        setSabrePcc('');
        loadStats();
      } else {
        showMessage('error', data.error);
      }
    } catch (error) {
      showMessage('error', 'Failed to store credentials');
    } finally {
      setLoading(false);
    }
  };

  const storeStripeCredentials = async () => {
    if (!stripeSecretKey || !stripePublishableKey) {
      showMessage('error', 'Secret Key and Publishable Key are required');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/vault/stripe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          secretKey: stripeSecretKey,
          publishableKey: stripePublishableKey,
          webhookSecret: stripeWebhook || undefined
        })
      });

      const data = await response.json();

      if (data.success) {
        showMessage('success', 'Stripe credentials stored successfully');
        setStripeSecretKey('');
        setStripePublishableKey('');
        setStripeWebhook('');
        loadStats();
      } else {
        showMessage('error', data.error);
      }
    } catch (error) {
      showMessage('error', 'Failed to store credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Secure Key Manager</h1>
        <p className="text-gray-600">
          Manage encrypted API keys and credentials for third-party services
        </p>
      </div>

      {message && (
        <Alert className={`mb-6 ${message.type === 'error' ? 'border-red-500' : 'border-green-500'}`}>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      {stats && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Vault Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div>
                <p className="text-sm text-gray-500">Total Credentials</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              {Object.entries(stats.byProvider || {}).map(([provider, count]) => (
                <div key={provider}>
                  <p className="text-sm text-gray-500 capitalize">{provider}</p>
                  <Badge variant="secondary">{count as number}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="coinbase" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="coinbase">Coinbase</TabsTrigger>
          <TabsTrigger value="sabre">Sabre</TabsTrigger>
          <TabsTrigger value="stripe">Stripe</TabsTrigger>
        </TabsList>

        <TabsContent value="coinbase">
          <Card>
            <CardHeader>
              <CardTitle>Coinbase Commerce</CardTitle>
              <CardDescription>
                Store your Coinbase Commerce API credentials for cryptocurrency payments
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="coinbase-api-key">API Key *</Label>
                <Input
                  id="coinbase-api-key"
                  type="password"
                  placeholder="Enter Coinbase API Key"
                  value={coinbaseApiKey}
                  onChange={(e) => setCoinbaseApiKey(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="coinbase-webhook">Webhook Secret (Optional)</Label>
                <Input
                  id="coinbase-webhook"
                  type="password"
                  placeholder="Enter Webhook Secret"
                  value={coinbaseWebhook}
                  onChange={(e) => setCoinbaseWebhook(e.target.value)}
                />
              </div>

              <Button
                onClick={storeCoinbaseCredentials}
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Storing...' : 'Store Coinbase Credentials'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sabre">
          <Card>
            <CardHeader>
              <CardTitle>Sabre GDS</CardTitle>
              <CardDescription>
                Store your Sabre API credentials for flight and hotel booking
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="sabre-client-id">Client ID *</Label>
                <Input
                  id="sabre-client-id"
                  type="text"
                  placeholder="Enter Sabre Client ID"
                  value={sabreClientId}
                  onChange={(e) => setSabreClientId(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="sabre-client-secret">Client Secret *</Label>
                <Input
                  id="sabre-client-secret"
                  type="password"
                  placeholder="Enter Sabre Client Secret"
                  value={sabreClientSecret}
                  onChange={(e) => setSabreClientSecret(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="sabre-pcc">PCC (Pseudo City Code) (Optional)</Label>
                <Input
                  id="sabre-pcc"
                  type="text"
                  placeholder="Enter PCC"
                  value={sabrePcc}
                  onChange={(e) => setSabrePcc(e.target.value)}
                />
              </div>

              <Button
                onClick={storeSabreCredentials}
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Storing...' : 'Store Sabre Credentials'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stripe">
          <Card>
            <CardHeader>
              <CardTitle>Stripe</CardTitle>
              <CardDescription>
                Store your Stripe API credentials for payment processing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="stripe-secret">Secret Key *</Label>
                <Input
                  id="stripe-secret"
                  type="password"
                  placeholder="sk_..."
                  value={stripeSecretKey}
                  onChange={(e) => setStripeSecretKey(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="stripe-publishable">Publishable Key *</Label>
                <Input
                  id="stripe-publishable"
                  type="text"
                  placeholder="pk_..."
                  value={stripePublishableKey}
                  onChange={(e) => setStripePublishableKey(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="stripe-webhook">Webhook Secret (Optional)</Label>
                <Input
                  id="stripe-webhook"
                  type="password"
                  placeholder="whsec_..."
                  value={stripeWebhook}
                  onChange={(e) => setStripeWebhook(e.target.value)}
                />
              </div>

              <Button
                onClick={storeStripeCredentials}
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Storing...' : 'Store Stripe Credentials'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Security Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-600">
          <p>✅ All credentials are encrypted using AES-256-GCM</p>
          <p>✅ Encryption keys are stored securely in environment variables</p>
          <p>✅ Credentials are never logged or exposed in responses</p>
          <p>✅ Each encryption uses a unique salt and IV</p>
          <p>⚠️ Keep your ENCRYPTION_KEY secure - losing it means losing access to encrypted data</p>
        </CardContent>
      </Card>
    </div>
  );
}
