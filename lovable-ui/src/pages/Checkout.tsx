import { useState } from 'react';
import { CreditCard, User, Mail, Phone, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useTripStore } from '@/store/tripStore';
import { toast } from 'sonner';

export default function Checkout() {
  const { selectedItems, getTotalCost, clearSelectedItems } = useTripStore();
  const [showSuccess, setShowSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    cardNumber: '',
    expiry: '',
    cvv: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.email || !formData.cardNumber) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setShowSuccess(true);
      clearSelectedItems();
    }, 2000);
  };

  const totalCost = getTotalCost();
  const tax = totalCost * 0.1;
  const serviceFee = 25;
  const grandTotal = totalCost + tax + serviceFee;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Checkout
          </h1>
          <p className="text-muted-foreground">Complete your booking</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Form Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Passenger Information */}
            <Card className="animate-fade-in-up">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  Passenger Information
                </CardTitle>
                <CardDescription>Enter traveler details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      className="pl-10"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      className="pl-10"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary" />
                  Payment Information
                </CardTitle>
                <CardDescription>Enter your payment details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cardNumber">Card Number *</Label>
                  <Input
                    id="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    value={formData.cardNumber}
                    onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiry">Expiry Date *</Label>
                    <Input
                      id="expiry"
                      placeholder="MM/YY"
                      value={formData.expiry}
                      onChange={(e) => handleInputChange('expiry', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvv">CVV *</Label>
                    <Input
                      id="cvv"
                      placeholder="123"
                      type="password"
                      maxLength={3}
                      value={formData.cvv}
                      onChange={(e) => handleInputChange('cvv', e.target.value)}
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-20 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
                <CardDescription>{selectedItems.length} items</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Selected Items */}
                <div className="space-y-3">
                  {selectedItems.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-muted-foreground truncate mr-2">{item.name}</span>
                      <span className="font-medium">${item.price}</span>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Cost Breakdown */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${totalCost}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax (10%)</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Service Fee</span>
                    <span>${serviceFee}</span>
                  </div>
                </div>

                <Separator />

                {/* Total */}
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total</span>
                  <span className="text-2xl font-bold text-primary">${grandTotal.toFixed(2)}</span>
                </div>

                {/* Submit Button */}
                <Button
                  onClick={handleSubmit}
                  disabled={isProcessing}
                  className="w-full bg-gradient-primary hover:shadow-glow transition-all duration-300"
                  size="lg"
                >
                  {isProcessing ? 'Processing...' : 'Complete Booking'}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  By completing this booking, you agree to our Terms of Service and Privacy Policy
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto mb-4 w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center animate-scale-in">
              <Check className="w-8 h-8 text-primary-foreground" />
            </div>
            <DialogTitle className="text-center text-2xl">Booking Confirmed!</DialogTitle>
            <DialogDescription className="text-center">
              Your trip has been successfully booked. A confirmation email has been sent to {formData.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="bg-gradient-card p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Booking Reference</p>
              <p className="text-lg font-bold">AMK-{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
            </div>
            <Button
              onClick={() => window.location.href = '/'}
              className="w-full bg-gradient-primary"
              size="lg"
            >
              Return to Home
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
