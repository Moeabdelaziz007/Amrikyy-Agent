/**
 * 💎 Crypto Payment Modal Component
 * واجهة الدفع بالعملات المشفرة - Crypto-First Platform
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  CheckCircle2,
  Clock,
  AlertCircle,
  Copy,
  ExternalLink,
  Bitcoin,
  Wallet,
  RefreshCw,
  Zap,
  Shield,
  TrendingUp,
} from 'lucide-react';
import QRCode from 'qrcode';

interface CryptoPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingData: {
    bookingId: string;
    userId: string;
    amountUSD: number;
    description?: string;
  };
  onSuccess: (invoice: any) => void;
}

interface CryptoOption {
  symbol: string;
  name: string;
  icon: string;
  network: string;
  minAmount: number;
}

interface Invoice {
  id: string;
  paymentInfo: {
    address: string;
    amount: string;
    currency: string;
    usdAmount: number;
    qrCode: string;
    expiresIn: number;
    network: string;
    explorerUrl: string;
  };
}

export default function CryptoPaymentModal({
  isOpen,
  onClose,
  bookingData,
  onSuccess,
}: CryptoPaymentModalProps) {
  const [step, setStep] = useState<
    'select' | 'payment' | 'confirming' | 'success'
  >('select');
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoOption | null>(
    null
  );
  const [cryptoOptions, setCryptoOptions] = useState<CryptoOption[]>([]);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [timeRemaining, setTimeRemaining] = useState<number>(1800); // 30 minutes
  const [verificationStatus, setVerificationStatus] = useState<any>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Load supported cryptocurrencies
  useEffect(() => {
    if (isOpen && step === 'select') {
      loadSupportedCryptos();
    }
  }, [isOpen, step]);

  // Generate QR code when invoice is created
  useEffect(() => {
    if (invoice?.paymentInfo.qrCode) {
      QRCode.toDataURL(invoice.paymentInfo.qrCode, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      })
        .then((url) => setQrCodeDataUrl(url))
        .catch((err) => console.error('QR Code generation failed:', err));
    }
  }, [invoice]);

  // Countdown timer
  useEffect(() => {
    if (step === 'payment' && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setError('فاتورة الدفع انتهت. يرجى إنشاء فاتورة جديدة.');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [step, timeRemaining]);

  // Auto-verify transaction
  useEffect(() => {
    if (step === 'confirming' && invoice) {
      const verifyInterval = setInterval(() => {
        verifyTransaction();
      }, 10000); // Check every 10 seconds

      return () => clearInterval(verifyInterval);
    }
  }, [step, invoice]);

  const loadSupportedCryptos = async () => {
    try {
      const response = await fetch('/api/crypto/supported');
      const data = await response.json();

      if (data.success) {
        setCryptoOptions(data.cryptocurrencies);
      }
    } catch (err) {
      console.error('Failed to load cryptocurrencies:', err);
    }
  };

  const createPaymentInvoice = async (crypto: CryptoOption) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/crypto/invoice/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...bookingData,
          cryptocurrency: crypto.symbol,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'فشل إنشاء الفاتورة');
      }

      setInvoice(data.invoice);
      setStep('payment');
      setTimeRemaining(data.paymentInfo.expiresIn);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  const verifyTransaction = async () => {
    if (!invoice) return;

    try {
      const response = await fetch(`/api/crypto/invoice/${invoice.id}/verify`, {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        setVerificationStatus(data.verification);

        if (data.verification.status === 'confirmed') {
          setStep('success');
          onSuccess(invoice);
        } else if (data.verification.status === 'confirming') {
          setStep('confirming');
        }
      }
    } catch (err) {
      console.error('Verification failed:', err);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gradient-to-br from-gray-900 to-black rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-gray-800"
        >
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-blue-600 p-6 flex items-center justify-between rounded-t-3xl z-10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  الدفع بالعملات المشفرة
                </h2>
                <p className="text-white/80 text-sm">
                  Crypto-First Platform 💎
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Error Display */}
            {error && (
              <motion.div
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-300 text-sm">{error}</p>
              </motion.div>
            )}

            {/* Step 1: Select Cryptocurrency */}
            {step === 'select' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="mb-6 text-center">
                  <p className="text-gray-300 text-lg mb-2">
                    المبلغ:{' '}
                    <span className="text-white font-bold text-2xl">
                      ${bookingData.amountUSD}
                    </span>
                  </p>
                  <p className="text-gray-500 text-sm">
                    اختر العملة المشفرة للدفع
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {cryptoOptions.map((crypto) => (
                    <motion.button
                      key={crypto.symbol}
                      onClick={() => {
                        setSelectedCrypto(crypto);
                        createPaymentInvoice(crypto);
                      }}
                      disabled={loading}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="p-6 bg-gradient-to-br from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 rounded-2xl border-2 border-gray-700 hover:border-blue-500 transition-all disabled:opacity-50"
                    >
                      <div className="text-4xl mb-2">{crypto.icon}</div>
                      <h3 className="text-white font-bold mb-1">
                        {crypto.symbol}
                      </h3>
                      <p className="text-gray-400 text-xs">{crypto.name}</p>
                      <p className="text-gray-500 text-xs mt-2">
                        {crypto.network}
                      </p>
                    </motion.button>
                  ))}
                </div>

                <div className="mt-6 flex items-start gap-3 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                  <Shield className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-blue-300 text-sm font-semibold mb-1">
                      دفع آمن 100%
                    </p>
                    <p className="text-blue-400/70 text-xs">
                      جميع المعاملات محمية بتقنية Blockchain. لن نصل أبداً إلى
                      محفظتك.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Payment Instructions */}
            {step === 'payment' && invoice && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 0, x: 0 }}
              >
                {/* Timer */}
                <div className="mb-6 text-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/20 border border-yellow-500/50 rounded-full">
                    <Clock className="w-4 h-4 text-yellow-400" />
                    <span className="text-yellow-300 font-mono text-sm">
                      {formatTime(timeRemaining)}
                    </span>
                  </div>
                  <p className="text-gray-500 text-xs mt-2">
                    الوقت المتبقي لإتمام الدفع
                  </p>
                </div>

                {/* Amount */}
                <div className="mb-6 text-center p-6 bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-2xl border border-purple-500/30">
                  <p className="text-gray-400 text-sm mb-2">المبلغ المطلوب</p>
                  <p className="text-4xl font-bold text-white mb-1">
                    {invoice.paymentInfo.amount} {invoice.paymentInfo.currency}
                  </p>
                  <p className="text-gray-500 text-sm">
                    ≈ ${invoice.paymentInfo.usdAmount} USD
                  </p>
                </div>

                {/* QR Code */}
                {qrCodeDataUrl && (
                  <div className="mb-6 flex justify-center">
                    <div className="p-4 bg-white rounded-2xl">
                      <img
                        src={qrCodeDataUrl}
                        alt="Payment QR Code"
                        className="w-64 h-64"
                      />
                    </div>
                  </div>
                )}

                {/* Address */}
                <div className="mb-6">
                  <label className="text-gray-400 text-sm mb-2 block">
                    عنوان المحفظة
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 p-4 bg-gray-800 rounded-xl border border-gray-700 font-mono text-sm text-white break-all">
                      {invoice.paymentInfo.address}
                    </div>
                    <button
                      onClick={() =>
                        copyToClipboard(invoice.paymentInfo.address)
                      }
                      className="p-4 bg-blue-600 hover:bg-blue-500 rounded-xl transition-colors"
                    >
                      {copied ? (
                        <CheckCircle2 className="w-5 h-5 text-white" />
                      ) : (
                        <Copy className="w-5 h-5 text-white" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Instructions */}
                <div className="mb-6 p-4 bg-gray-800/50 rounded-xl space-y-3">
                  <h3 className="text-white font-semibold flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-400" />
                    خطوات الدفع
                  </h3>
                  <ol className="list-decimal list-inside space-y-2 text-gray-300 text-sm">
                    <li>افتح محفظتك المشفرة (MetaMask، Trust Wallet، إلخ)</li>
                    <li>امسح رمز QR أو انسخ العنوان أعلاه</li>
                    <li>
                      أرسل المبلغ المحدد بالضبط:{' '}
                      <strong>
                        {invoice.paymentInfo.amount}{' '}
                        {invoice.paymentInfo.currency}
                      </strong>
                    </li>
                    <li>انتظر التأكيد (عادة 2-15 دقيقة)</li>
                  </ol>
                </div>

                {/* Verify Button */}
                <button
                  onClick={verifyTransaction}
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <RefreshCw
                    className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`}
                  />
                  تحقق من الدفع
                </button>

                {/* Explorer Link */}
                <a
                  href={invoice.paymentInfo.explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 flex items-center justify-center gap-2 text-blue-400 hover:text-blue-300 text-sm transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  عرض على Block Explorer
                </a>
              </motion.div>
            )}

            {/* Step 3: Confirming */}
            {step === 'confirming' && verificationStatus && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="w-20 h-20 mx-auto mb-6 border-4 border-blue-500 border-t-transparent rounded-full"
                />
                <h3 className="text-2xl font-bold text-white mb-2">
                  جاري التأكيد...
                </h3>
                <p className="text-gray-400 mb-4">
                  تم استلام المعاملة! في انتظار{' '}
                  {verificationStatus.requiredConfirmations} تأكيد
                </p>
                <div className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500/20 border border-blue-500/50 rounded-full">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                  <span className="text-blue-300 font-semibold">
                    {verificationStatus.confirmations} /{' '}
                    {verificationStatus.requiredConfirmations} تأكيدات
                  </span>
                </div>
                {verificationStatus.transactionHash && (
                  <p className="text-gray-500 text-xs mt-4 font-mono">
                    TX: {formatAddress(verificationStatus.transactionHash)}
                  </p>
                )}
              </motion.div>
            )}

            {/* Step 4: Success */}
            {step === 'success' && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center py-12"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.2 }}
                  className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center"
                >
                  <CheckCircle2 className="w-16 h-16 text-white" />
                </motion.div>
                <h3 className="text-3xl font-bold text-white mb-2">
                  تم الدفع بنجاح! 🎉
                </h3>
                <p className="text-gray-400 mb-6">
                  تم تأكيد دفعتك على Blockchain. حجزك الآن مؤكد!
                </p>
                <button
                  onClick={onClose}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold rounded-xl transition-all"
                >
                  إغلاق
                </button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
