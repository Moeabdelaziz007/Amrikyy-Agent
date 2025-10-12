# 💎 نظام الدفع بالعملات المشفرة - Amrikyy Crypto-First Platform

## 🎯 نظرة عامة

تم بناء Amrikyy كأول منصة سفر **Crypto-First** في الشرق الأوسط، مع دعم كامل للدفع بالعملات المشفرة عبر:

- Bitcoin (BTC)
- Ethereum (ETH)
- USDT (Tether)
- USDC (USD Coin)
- BNB (Binance Coin)
- MATIC (Polygon)

---

## 🏗️ البنية المعمارية

```
┌─────────────────────────────────────────────────────────┐
│                   FRONTEND                              │
│  ┌────────────────────────────────────────────────┐    │
│  │  CryptoPaymentModal.tsx                        │    │
│  │  - Select Cryptocurrency                       │    │
│  │  - Display QR Code                             │    │
│  │  - Real-time Verification                      │    │
│  │  - Transaction Status                          │    │
│  └────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
                          ↓ API Calls
┌─────────────────────────────────────────────────────────┐
│                   BACKEND API                           │
│  ┌────────────────────────────────────────────────┐    │
│  │  /api/crypto/supported                         │    │
│  │  /api/crypto/invoice/create                    │    │
│  │  /api/crypto/invoice/:id/verify                │    │
│  │  /api/crypto/refund                            │    │
│  └────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                   SERVICES                              │
│  ┌────────────────────────────────────────────────┐    │
│  │  CryptoPaymentService                          │    │
│  │  - Web3 Integration                            │    │
│  │  - Blockchain Scanning                         │    │
│  │  - Transaction Verification                    │    │
│  │  - Price Feeds (CoinGecko)                     │    │
│  └────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                   BLOCKCHAIN                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │  Ethereum    │  │  BSC         │  │  Polygon     │ │
│  │  Network     │  │  Network     │  │  Network     │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                         │
│  ┌────────────────────────────────────────────────┐   │
│  │  Smart Contracts                                │   │
│  │  - AmrikyyBookingEscrow.sol                     │   │
│  │  - Automated Escrow System                      │   │
│  │  - Dispute Resolution                           │   │
│  └────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                   DATABASE                              │
│  ┌────────────────────────────────────────────────┐    │
│  │  Supabase (PostgreSQL)                         │    │
│  │  - crypto_payments                             │    │
│  │  - crypto_refunds                              │    │
│  │  - user_crypto_wallets                         │    │
│  │  - smart_contract_escrows                      │    │
│  └────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 دليل الاستخدام السريع

### 1. إعداد Backend

```bash
# تثبيت المكتبات المطلوبة
cd backend
npm install web3 axios @supabase/supabase-js qrcode

# إعداد متغيرات البيئة
cat >> .env << EOF
# Merchant Wallet Addresses
MERCHANT_BTC_ADDRESS=your_bitcoin_address
MERCHANT_ETH_ADDRESS=0xYourEthereumAddress
MERCHANT_BSC_ADDRESS=0xYourBSCAddress
MERCHANT_POLYGON_ADDRESS=0xYourPolygonAddress

# RPC Endpoints (Optional - uses public by default)
ETH_RPC_URL=https://mainnet.infura.io/v3/YOUR_KEY
BSC_RPC_URL=https://bsc-dataseed.binance.org/
POLYGON_RPC_URL=https://polygon-rpc.com/
EOF

# إنشاء جداول قاعدة البيانات
psql $SUPABASE_URL -f backend/database/crypto-payments-schema.sql
```

### 2. إعداد Frontend

```bash
cd frontend
npm install qrcode framer-motion

# يتم استيراد المكون تلقائياً
```

### 3. استخدام النظام

```typescript
// في صفحة الدفع
import CryptoPaymentModal from './components/CryptoPaymentModal';

function CheckoutPage() {
  const [showCrypto, setShowCrypto] = useState(false);

  const handleCryptoPayment = () => {
    setShowCrypto(true);
  };

  const handlePaymentSuccess = (invoice) => {
    console.log('Payment confirmed!', invoice);
    // Redirect to success page
  };

  return (
    <>
      <button onClick={handleCryptoPayment}>💎 الدفع بالعملات المشفرة</button>

      <CryptoPaymentModal
        isOpen={showCrypto}
        onClose={() => setShowCrypto(false)}
        bookingData={{
          bookingId: 'booking-123',
          userId: 'user-456',
          amountUSD: 250,
          description: 'Hotel Booking - Cairo',
        }}
        onSuccess={handlePaymentSuccess}
      />
    </>
  );
}
```

---

## 📡 API Endpoints

### 1. الحصول على العملات المدعومة

```bash
GET /api/crypto/supported

Response:
{
  "success": true,
  "cryptocurrencies": [
    {
      "symbol": "BTC",
      "name": "Bitcoin",
      "icon": "₿",
      "network": "bitcoin",
      "minAmount": 0.0001
    },
    {
      "symbol": "USDT",
      "name": "Tether USD",
      "icon": "₮",
      "network": "ethereum",
      "minAmount": 10
    }
  ]
}
```

### 2. إنشاء فاتورة دفع

```bash
POST /api/crypto/invoice/create
Content-Type: application/json

{
  "bookingId": "booking-123",
  "userId": "user-456",
  "amountUSD": 250,
  "cryptocurrency": "USDT",
  "customerEmail": "user@example.com"
}

Response:
{
  "success": true,
  "invoice": {
    "id": "AMK-A1B2C3D4",
    "paymentInfo": {
      "address": "0x1234567890abcdef",
      "amount": "250.00",
      "currency": "USDT",
      "usdAmount": 250,
      "qrCode": "ethereum:0x1234...?amount=250",
      "expiresIn": 1800,
      "network": "ethereum",
      "explorerUrl": "https://etherscan.io/address/0x1234..."
    }
  }
}
```

### 3. التحقق من الدفع

```bash
POST /api/crypto/invoice/:invoiceId/verify

Response:
{
  "success": true,
  "verification": {
    "status": "confirming",
    "confirmations": 3,
    "requiredConfirmations": 12,
    "transactionHash": "0xabcdef...",
    "explorerUrl": "https://etherscan.io/tx/0xabcdef..."
  }
}
```

### 4. طلب استرداد

```bash
POST /api/crypto/refund
Content-Type: application/json

{
  "invoiceId": "AMK-A1B2C3D4",
  "reason": "Booking cancelled by user"
}

Response:
{
  "success": true,
  "refund": {
    "id": "uuid-1234",
    "status": "pending",
    "amount": "250.00",
    "cryptocurrency": "USDT"
  },
  "message": "Refund will be processed within 24 hours"
}
```

---

## 🔐 الأمان

### 1. حماية المحافظ

- ✅ **Cold Storage:** استخدم محافظ باردة للمبالغ الكبيرة
- ✅ **Multi-Sig:** استخدم توقيعات متعددة للعمليات الحساسة
- ✅ **Rate Limiting:** حد من عدد الطلبات لمنع الهجمات
- ✅ **Encryption:** جميع البيانات الحساسة مشفرة

### 2. التحقق من المعاملات

```javascript
// يتم التحقق من المعاملات عبر:
1. Block Explorer APIs (Etherscan, BSCScan, etc.)
2. Web3 RPC Endpoints
3. Required Confirmations (2-128 حسب الشبكة)
```

### 3. معالجة الأخطاء

```javascript
// جميع الأخطاء يتم تسجيلها ومراقبتها
try {
  await processPayment();
} catch (error) {
  logger.error('Payment failed:', error);
  await notifyAdmin(error);
  await refundUser(userId);
}
```

---

## 📊 مراقبة المعاملات

### Dashboard Metrics

```sql
-- إجمالي المدفوعات اليومية
SELECT
  DATE(created_at) as date,
  COUNT(*) as total_payments,
  SUM(amount_usd) as volume_usd
FROM crypto_payments
WHERE status = 'confirmed'
GROUP BY DATE(created_at);

-- العملة الأكثر استخداماً
SELECT
  cryptocurrency,
  COUNT(*) as usage_count,
  SUM(amount_usd) as total_volume
FROM crypto_payments
GROUP BY cryptocurrency
ORDER BY usage_count DESC;

-- معدل النجاح
SELECT
  COUNT(CASE WHEN status = 'confirmed' THEN 1 END) * 100.0 / COUNT(*) as success_rate
FROM crypto_payments;
```

---

## 🧪 اختبار النظام

### 1. اختبار الإنشاء

```bash
curl -X POST http://localhost:5000/api/crypto/invoice/create \
  -H "Content-Type: application/json" \
  -d '{
    "bookingId": "test-123",
    "userId": "user-456",
    "amountUSD": 100,
    "cryptocurrency": "USDT"
  }'
```

### 2. اختبار التحقق

```bash
curl -X POST http://localhost:5000/api/crypto/invoice/AMK-XXXX/verify
```

### 3. اختبار الشبكة

```javascript
// Test Ethereum Connection
const web3 = new Web3('https://mainnet.infura.io/v3/YOUR_KEY');
const blockNumber = await web3.eth.getBlockNumber();
console.log('Current block:', blockNumber);
```

---

## 🎓 Best Practices

### 1. إدارة الأسعار

```javascript
// تحديث الأسعار كل 5 دقائق
setInterval(async () => {
  const prices = await fetchCryptoPrices();
  await updatePriceCache(prices);
}, 5 * 60 * 1000);
```

### 2. معالجة التأكيدات

```javascript
// تأكيدات مختلفة حسب الشبكة
const CONFIRMATIONS = {
  bitcoin: 2, // ~20 دقيقة
  ethereum: 12, // ~3 دقائق
  bsc: 15, // ~45 ثانية
  polygon: 128, // ~4 دقائق
};
```

### 3. إدارة Timeout

```javascript
// انتهاء الفاتورة بعد 30 دقيقة
const INVOICE_EXPIRY = 30 * 60 * 1000;

// تنظيف تلقائي للفواتير المنتهية
cron.schedule('*/5 * * * *', async () => {
  await expireOldInvoices();
});
```

---

## 🔄 Smart Contract Deployment

### 1. إعداد Hardhat

```bash
cd backend
npm install --save-dev hardhat @openzeppelin/contracts

npx hardhat init
```

### 2. Compile Contract

```bash
npx hardhat compile
```

### 3. Deploy to Network

```javascript
// scripts/deploy-escrow.js
async function main() {
  const AmrikyyEscrow = await ethers.getContractFactory('AmrikyyBookingEscrow');
  const escrow = await AmrikyyEscrow.deploy(
    '0xFeeRecipientAddress' // Amrikyy wallet
  );

  await escrow.deployed();
  console.log('Contract deployed to:', escrow.address);
}

main();
```

```bash
# Deploy to Ethereum Mainnet
npx hardhat run scripts/deploy-escrow.js --network mainnet

# Deploy to BSC
npx hardhat run scripts/deploy-escrow.js --network bsc

# Deploy to Polygon
npx hardhat run scripts/deploy-escrow.js --network polygon
```

---

## 💡 استخدام Smart Contract

```javascript
// الاتصال بالعقد
const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

// إنشاء حجز
const tx = await contract.createBooking(
  sellerAddress,
  arbiterAddress,
  ethers.utils.parseEther('1.0'), // 1 ETH
  ethers.constants.AddressZero, // ETH (not ERC20)
  86400, // 24 hours
  'booking-hash-123',
  JSON.stringify({ hotel: 'Cairo Marriott' })
);

await tx.wait();

// تمويل الحجز
const fundTx = await contract.fundBooking(bookingId, {
  value: ethers.utils.parseEther('1.0'),
});

await fundTx.wait();
```

---

## 📈 Roadmap

### Phase 1: ✅ Complete

- [x] Backend Service
- [x] API Endpoints
- [x] Database Schema
- [x] Frontend Component
- [x] Smart Contract

### Phase 2: 🚧 In Progress

- [ ] WalletConnect Integration
- [ ] MetaMask Integration
- [ ] Hardware Wallet Support
- [ ] Multi-Signature Wallets

### Phase 3: 📋 Planned

- [ ] Lightning Network (Bitcoin)
- [ ] Layer 2 Solutions (Arbitrum, Optimism)
- [ ] DeFi Integration
- [ ] Staking Rewards
- [ ] NFT Booking Receipts

---

## 🆘 الدعم والمساعدة

### الأسئلة الشائعة

**Q: ما هي رسوم المعاملات؟**
A: 2% رسوم منصة + رسوم شبكة Blockchain (متغيرة)

**Q: كم يستغرق التأكيد؟**
A:

- Bitcoin: 10-30 دقيقة
- Ethereum: 2-5 دقائق
- BSC: 30-60 ثانية
- USDT/USDC: حسب الشبكة

**Q: هل يمكن استرداد الأموال؟**
A: نعم، خلال 24-48 ساعة للحجوزات الملغاة

**Q: ما هي العملات المدعومة؟**
A: BTC, ETH, USDT, USDC, BNB, MATIC

### جهات الاتصال

- 📧 Email: crypto@amrikyy.com
- 💬 Telegram: @AmrikyyCrypto
- 🐦 Twitter: @AmrikyyPlatform
- 📱 WhatsApp: +20-XXX-XXXX

---

## 📜 License

MIT License - Amrikyy Platform 2025

---

**🎉 تهانينا! لديك الآن أول منصة سفر Crypto-First في الشرق الأوسط! 💎**
