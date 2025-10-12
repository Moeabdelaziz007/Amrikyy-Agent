// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title AmrikyyBookingEscrow
 * @dev Smart Contract لإدارة حجوزات Amrikyy بنظام Escrow آمن
 * 
 * المزايا:
 * - Escrow تلقائي للأموال
 * - حماية للمشتري والبائع
 * - نظام استرداد تلقائي
 * - دعم متعدد للعملات (ETH, USDT, USDC, etc.)
 * - نظام نزاعات مع محكّم
 */
contract AmrikyyBookingEscrow is ReentrancyGuard, Pausable, Ownable {
    using SafeERC20 for IERC20;

    // ============================================
    // الهياكل (Structs)
    // ============================================

    enum BookingStatus {
        Created,        // تم الإنشاء
        Funded,         // تم التمويل
        Completed,      // مكتمل
        Cancelled,      // ملغي
        Disputed,       // منازع فيه
        Refunded        // مسترد
    }

    struct Booking {
        uint256 id;
        address buyer;          // المشتري (المسافر)
        address seller;         // البائع (Amrikyy)
        address arbiter;        // المحكّم (للنزاعات)
        uint256 amount;         // المبلغ
        address paymentToken;   // عنوان العملة (0x0 للETH)
        BookingStatus status;
        uint256 createdAt;
        uint256 fundedAt;
        uint256 completedAt;
        uint256 expiresAt;
        string bookingHash;     // معرف الحجز في قاعدة البيانات
        string metadata;        // بيانات إضافية (JSON)
    }

    // ============================================
    // المتغيرات
    // ============================================

    uint256 public bookingCounter;
    uint256 public platformFeePercent = 2; // 2% رسوم منصة
    address public feeRecipient;           // مستلم الرسوم
    uint256 public constant MAX_FEE = 5;   // أقصى رسوم = 5%

    mapping(uint256 => Booking) public bookings;
    mapping(address => uint256[]) public buyerBookings;
    mapping(string => uint256) public bookingHashToId;

    // عملات مدعومة
    mapping(address => bool) public supportedTokens;

    // ============================================
    // الأحداث (Events)
    // ============================================

    event BookingCreated(
        uint256 indexed bookingId,
        address indexed buyer,
        uint256 amount,
        address paymentToken,
        string bookingHash
    );

    event BookingFunded(
        uint256 indexed bookingId,
        address indexed buyer,
        uint256 amount
    );

    event BookingCompleted(
        uint256 indexed bookingId,
        address indexed buyer,
        uint256 amount
    );

    event BookingCancelled(
        uint256 indexed bookingId,
        address indexed buyer,
        string reason
    );

    event BookingRefunded(
        uint256 indexed bookingId,
        address indexed buyer,
        uint256 amount
    );

    event DisputeRaised(
        uint256 indexed bookingId,
        address indexed raiser,
        string reason
    );

    event DisputeResolved(
        uint256 indexed bookingId,
        address winner,
        uint256 amount
    );

    event FeeUpdated(uint256 oldFee, uint256 newFee);

    // ============================================
    // Modifiers
    // ============================================

    modifier bookingExists(uint256 _bookingId) {
        require(bookings[_bookingId].id != 0, "Booking does not exist");
        _;
    }

    modifier onlyBuyer(uint256 _bookingId) {
        require(
            bookings[_bookingId].buyer == msg.sender,
            "Only buyer can call this"
        );
        _;
    }

    modifier onlySeller(uint256 _bookingId) {
        require(
            bookings[_bookingId].seller == msg.sender,
            "Only seller can call this"
        );
        _;
    }

    modifier onlyArbiter(uint256 _bookingId) {
        require(
            bookings[_bookingId].arbiter == msg.sender,
            "Only arbiter can call this"
        );
        _;
    }

    // ============================================
    // Constructor
    // ============================================

    constructor(address _feeRecipient) {
        require(_feeRecipient != address(0), "Invalid fee recipient");
        feeRecipient = _feeRecipient;
    }

    // ============================================
    // وظائف الحجز
    // ============================================

    /**
     * @dev إنشاء حجز جديد
     */
    function createBooking(
        address _seller,
        address _arbiter,
        uint256 _amount,
        address _paymentToken,
        uint256 _expiresIn,
        string memory _bookingHash,
        string memory _metadata
    ) external whenNotPaused returns (uint256) {
        require(_seller != address(0), "Invalid seller address");
        require(_arbiter != address(0), "Invalid arbiter address");
        require(_amount > 0, "Amount must be greater than 0");
        require(
            _paymentToken == address(0) || supportedTokens[_paymentToken],
            "Payment token not supported"
        );
        require(_expiresIn > 0, "Expiration time must be set");
        require(bytes(_bookingHash).length > 0, "Booking hash required");
        require(
            bookingHashToId[_bookingHash] == 0,
            "Booking hash already exists"
        );

        bookingCounter++;
        uint256 bookingId = bookingCounter;

        bookings[bookingId] = Booking({
            id: bookingId,
            buyer: msg.sender,
            seller: _seller,
            arbiter: _arbiter,
            amount: _amount,
            paymentToken: _paymentToken,
            status: BookingStatus.Created,
            createdAt: block.timestamp,
            fundedAt: 0,
            completedAt: 0,
            expiresAt: block.timestamp + _expiresIn,
            bookingHash: _bookingHash,
            metadata: _metadata
        });

        buyerBookings[msg.sender].push(bookingId);
        bookingHashToId[_bookingHash] = bookingId;

        emit BookingCreated(bookingId, msg.sender, _amount, _paymentToken, _bookingHash);

        return bookingId;
    }

    /**
     * @dev تمويل الحجز (إرسال الأموال إلى Escrow)
     */
    function fundBooking(uint256 _bookingId)
        external
        payable
        nonReentrant
        whenNotPaused
        bookingExists(_bookingId)
        onlyBuyer(_bookingId)
    {
        Booking storage booking = bookings[_bookingId];
        
        require(
            booking.status == BookingStatus.Created,
            "Booking already funded or completed"
        );
        require(block.timestamp < booking.expiresAt, "Booking expired");

        if (booking.paymentToken == address(0)) {
            // ETH payment
            require(msg.value == booking.amount, "Incorrect ETH amount");
        } else {
            // ERC20 token payment
            IERC20(booking.paymentToken).safeTransferFrom(
                msg.sender,
                address(this),
                booking.amount
            );
        }

        booking.status = BookingStatus.Funded;
        booking.fundedAt = block.timestamp;

        emit BookingFunded(_bookingId, msg.sender, booking.amount);
    }

    /**
     * @dev إكمال الحجز وإرسال الأموال للبائع
     */
    function completeBooking(uint256 _bookingId)
        external
        nonReentrant
        bookingExists(_bookingId)
        onlySeller(_bookingId)
    {
        Booking storage booking = bookings[_bookingId];
        
        require(
            booking.status == BookingStatus.Funded,
            "Booking not funded"
        );

        booking.status = BookingStatus.Completed;
        booking.completedAt = block.timestamp;

        // حساب الرسوم
        uint256 fee = (booking.amount * platformFeePercent) / 100;
        uint256 sellerAmount = booking.amount - fee;

        // إرسال الأموال
        if (booking.paymentToken == address(0)) {
            // ETH
            payable(feeRecipient).transfer(fee);
            payable(booking.seller).transfer(sellerAmount);
        } else {
            // ERC20
            IERC20(booking.paymentToken).safeTransfer(feeRecipient, fee);
            IERC20(booking.paymentToken).safeTransfer(booking.seller, sellerAmount);
        }

        emit BookingCompleted(_bookingId, booking.buyer, booking.amount);
    }

    /**
     * @dev إلغاء الحجز واسترداد الأموال
     */
    function cancelBooking(uint256 _bookingId, string memory _reason)
        external
        nonReentrant
        bookingExists(_bookingId)
        onlyBuyer(_bookingId)
    {
        Booking storage booking = bookings[_bookingId];
        
        require(
            booking.status == BookingStatus.Funded,
            "Booking not funded or already processed"
        );

        booking.status = BookingStatus.Cancelled;

        // استرداد كامل المبلغ (بدون رسوم عند الإلغاء)
        if (booking.paymentToken == address(0)) {
            payable(booking.buyer).transfer(booking.amount);
        } else {
            IERC20(booking.paymentToken).safeTransfer(booking.buyer, booking.amount);
        }

        emit BookingCancelled(_bookingId, booking.buyer, _reason);
        emit BookingRefunded(_bookingId, booking.buyer, booking.amount);
    }

    /**
     * @dev رفع نزاع
     */
    function raiseDispute(uint256 _bookingId, string memory _reason)
        external
        bookingExists(_bookingId)
    {
        Booking storage booking = bookings[_bookingId];
        
        require(
            msg.sender == booking.buyer || msg.sender == booking.seller,
            "Only parties can raise dispute"
        );
        require(
            booking.status == BookingStatus.Funded,
            "Booking not funded"
        );

        booking.status = BookingStatus.Disputed;

        emit DisputeRaised(_bookingId, msg.sender, _reason);
    }

    /**
     * @dev حل النزاع (المحكّم فقط)
     */
    function resolveDispute(uint256 _bookingId, bool _favorBuyer)
        external
        nonReentrant
        bookingExists(_bookingId)
        onlyArbiter(_bookingId)
    {
        Booking storage booking = bookings[_bookingId];
        
        require(
            booking.status == BookingStatus.Disputed,
            "Booking not disputed"
        );

        address winner;
        if (_favorBuyer) {
            booking.status = BookingStatus.Refunded;
            winner = booking.buyer;
            
            // استرداد للمشتري
            if (booking.paymentToken == address(0)) {
                payable(booking.buyer).transfer(booking.amount);
            } else {
                IERC20(booking.paymentToken).safeTransfer(booking.buyer, booking.amount);
            }
        } else {
            booking.status = BookingStatus.Completed;
            booking.completedAt = block.timestamp;
            winner = booking.seller;
            
            // دفع للبائع
            uint256 fee = (booking.amount * platformFeePercent) / 100;
            uint256 sellerAmount = booking.amount - fee;
            
            if (booking.paymentToken == address(0)) {
                payable(feeRecipient).transfer(fee);
                payable(booking.seller).transfer(sellerAmount);
            } else {
                IERC20(booking.paymentToken).safeTransfer(feeRecipient, fee);
                IERC20(booking.paymentToken).safeTransfer(booking.seller, sellerAmount);
            }
        }

        emit DisputeResolved(_bookingId, winner, booking.amount);
    }

    /**
     * @dev استرداد تلقائي للحجوزات المنتهية
     */
    function autoRefundExpired(uint256 _bookingId)
        external
        nonReentrant
        bookingExists(_bookingId)
    {
        Booking storage booking = bookings[_bookingId];
        
        require(
            booking.status == BookingStatus.Funded,
            "Booking not funded"
        );
        require(
            block.timestamp > booking.expiresAt,
            "Booking not expired yet"
        );

        booking.status = BookingStatus.Refunded;

        // استرداد كامل
        if (booking.paymentToken == address(0)) {
            payable(booking.buyer).transfer(booking.amount);
        } else {
            IERC20(booking.paymentToken).safeTransfer(booking.buyer, booking.amount);
        }

        emit BookingRefunded(_bookingId, booking.buyer, booking.amount);
    }

    // ============================================
    // وظائف الإدارة
    // ============================================

    function updatePlatformFee(uint256 _newFee) external onlyOwner {
        require(_newFee <= MAX_FEE, "Fee exceeds maximum");
        uint256 oldFee = platformFeePercent;
        platformFeePercent = _newFee;
        emit FeeUpdated(oldFee, _newFee);
    }

    function updateFeeRecipient(address _newRecipient) external onlyOwner {
        require(_newRecipient != address(0), "Invalid address");
        feeRecipient = _newRecipient;
    }

    function addSupportedToken(address _token) external onlyOwner {
        require(_token != address(0), "Invalid token address");
        supportedTokens[_token] = true;
    }

    function removeSupportedToken(address _token) external onlyOwner {
        supportedTokens[_token] = false;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    // ============================================
    // وظائف العرض
    // ============================================

    function getBooking(uint256 _bookingId)
        external
        view
        returns (Booking memory)
    {
        return bookings[_bookingId];
    }

    function getBookingByHash(string memory _hash)
        external
        view
        returns (Booking memory)
    {
        uint256 bookingId = bookingHashToId[_hash];
        require(bookingId != 0, "Booking not found");
        return bookings[bookingId];
    }

    function getBuyerBookings(address _buyer)
        external
        view
        returns (uint256[] memory)
    {
        return buyerBookings[_buyer];
    }

    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }

    // ============================================
    // Fallback
    // ============================================

    receive() external payable {}
}

