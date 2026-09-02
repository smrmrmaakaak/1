import React, { useState } from 'react';
import { loadTossPayments } from '@tosspayments/payment-sdk';
import { sound } from './AudioEngine';

// Toss Payments Client Key (supports both test and live keys)
const TOSS_CLIENT_KEY = import.meta.env.VITE_TOSS_CLIENT_KEY || 'test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq';

export default function PaymentModal({ product, book, onClose, onSuccess }) {
  // STRICT SAFETY GUARD: Block payment execution if product is already sold out
  if (product?.isSoldOut) {
    return (
      <div className="toss-payment-modal-overlay" onClick={onClose}>
        <div className="toss-payment-modal-card soldout-blocked-card" onClick={e => e.stopPropagation()}>
          <div className="soldout-blocked-content">
            <span className="soldout-blocked-crest">🏛️</span>
            <span className="soldout-blocked-badge">SOLD OUT • 결제 차단</span>
            <h3 className="soldout-blocked-title">이미 공식 소장 완료된 성물입니다</h3>
            <p className="soldout-blocked-desc">
              본 작품(<strong>{product?.name}</strong>)은 프라이빗 컬렉터에게 소장(결제 완료)되어 추가 결제가 엄격히 제한됩니다.
            </p>
            <button
              type="button"
              className="soldout-blocked-close-btn"
              onClick={onClose}
            >
              도감으로 돌아가기 ✕
            </button>
          </div>
        </div>
      </div>
    );
  }

  const [paymentPlan, setPaymentPlan] = useState('full'); // 'full', 'deposit', 'test100'
  const [paymentMethod, setPaymentMethod] = useState('CARD'); // 'CARD', 'KAKAOPAY', 'TOSSPAY', 'NAVERPAY', 'VIRTUAL_ACCOUNT'
  const [deliveryType, setDeliveryType] = useState('direct'); // 'direct' (보안 직송), 'visit' (수장고 방문)
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const brandName = book?.brandName || product?.brand || '스페인 야드로 & 나오 공방';
  const heroYear = book?.heroYear || product?.era || '1972';
  const origin = book?.origin || '스페인 발렌시아 공방';

  const [formData, setFormData] = useState({
    buyerName: 'VIP 수집가',
    buyerPhone: '010-1234-5678',
    buyerEmail: 'collector@labellejian.com',
    deliveryAddress: '서울특별시 강남구 압구정로 123 라벨르지안 수장고',
    orderMemo: '무결점 완품 안전 보안 특송 및 보증서 동봉 요청'
  });

  // Calculate prices
  const rawPriceStr = product?.value ? product.value.replace(/[^0-9]/g, '') : '8000000';
  const fullPrice = parseInt(rawPriceStr, 10) || 8000000;
  const depositPrice = Math.round(fullPrice * 0.1); // 10% deposit
  
  let activeAmount = fullPrice;
  if (paymentPlan === 'deposit') activeAmount = depositPrice;
  else if (paymentPlan === 'test100') activeAmount = 100; // 100 KRW Real card test

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const generateOrderId = () => {
    const brandPrefix = brandName.replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase() || 'ANTQ';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(1000 + Math.random() * 9000);
    return `ORD-${brandPrefix}-${timestamp}-${random}`;
  };

  const handleExecutePayment = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    if (sound?.playSealStamp) {
      sound.playSealStamp();
    }

    const orderId = generateOrderId();
    let orderName = `[소장 완납] ${product?.name || '성물'}`;
    if (paymentPlan === 'deposit') {
      orderName = `[VIP 계약금 10%] ${product?.name || '성물'}`;
    } else if (paymentPlan === 'test100') {
      orderName = `[실 결제 테스트 100원] ${product?.name || '성물'}`;
    }

    const returnUrl = window.location.origin + window.location.pathname;

    try {
      // 1. Initialize Toss Payments SDK
      const tossPayments = await loadTossPayments(TOSS_CLIENT_KEY);

      // 2. Launch Real Toss Payments Checkout Modal
      if (paymentMethod === 'CARD') {
        await tossPayments.requestPayment('카드', {
          amount: activeAmount,
          orderId: orderId,
          orderName: orderName,
          customerName: formData.buyerName,
          customerEmail: formData.buyerEmail,
          successUrl: returnUrl + '?payment_success=true&orderId=' + orderId + '&amount=' + activeAmount,
          failUrl: returnUrl + '?payment_fail=true'
        });
      } else if (paymentMethod === 'KAKAOPAY') {
        await tossPayments.requestPayment('카드', {
          amount: activeAmount,
          orderId: orderId,
          orderName: orderName,
          customerName: formData.buyerName,
          flowMode: 'DIRECT',
          easyPay: 'KAKAOPAY',
          successUrl: returnUrl + '?payment_success=true&orderId=' + orderId + '&amount=' + activeAmount,
          failUrl: returnUrl + '?payment_fail=true'
        });
      } else if (paymentMethod === 'TOSSPAY') {
        await tossPayments.requestPayment('카드', {
          amount: activeAmount,
          orderId: orderId,
          orderName: orderName,
          customerName: formData.buyerName,
          flowMode: 'DIRECT',
          easyPay: 'TOSSPAY',
          successUrl: returnUrl + '?payment_success=true&orderId=' + orderId + '&amount=' + activeAmount,
          failUrl: returnUrl + '?payment_fail=true'
        });
      } else if (paymentMethod === 'NAVERPAY') {
        await tossPayments.requestPayment('카드', {
          amount: activeAmount,
          orderId: orderId,
          orderName: orderName,
          customerName: formData.buyerName,
          flowMode: 'DIRECT',
          easyPay: 'NAVERPAY',
          successUrl: returnUrl + '?payment_success=true&orderId=' + orderId + '&amount=' + activeAmount,
          failUrl: returnUrl + '?payment_fail=true'
        });
      } else if (paymentMethod === 'VIRTUAL_ACCOUNT') {
        await tossPayments.requestPayment('가상계좌', {
          amount: activeAmount,
          orderId: orderId,
          orderName: orderName,
          customerName: formData.buyerName,
          validHours: 72,
          cashReceipt: { type: '소득공제' },
          successUrl: returnUrl + '?payment_success=true&orderId=' + orderId + '&amount=' + activeAmount,
          failUrl: returnUrl + '?payment_fail=true'
        });
      }
    } catch (err) {
      console.warn('Toss Payments error or cancelled:', err);
      setIsLoading(false);
      if (err.code === 'USER_CANCEL') {
        setErrorMessage('결제가 취소되었습니다.');
      } else {
        setErrorMessage(err.message || '결제 진행 중 오류가 발생했습니다. 다시 시도해 주세요.');
      }
    }
  };

  return (
    <div className="payment-modal-backdrop" onClick={onClose}>
      <div className="payment-parchment-sheet" onClick={(e) => e.stopPropagation()}>
        {/* Modal Top Header */}
        <header className="payment-sheet-header">
          <div className="sheet-title-group">
            <span className="sheet-kicker">ARCHIVUM IMPERIALE • EMPTIO OFFICALIS</span>
            <h2 className="sheet-title">성물 공식 소장 주문 및 결제서</h2>
            <span className="sheet-sub">토스페이먼츠 정식 PG 연동 · 1:1 VIP 보안 에스크로 실 결제</span>
          </div>
          <button
            type="button"
            className="payment-close-btn"
            onClick={onClose}
            aria-label="결제창 닫기"
          >
            ✕
          </button>
        </header>

        {/* Scrollable Content Body */}
        <form onSubmit={handleExecutePayment} className="payment-scroll-body">
          {/* 1. Selected Artwork Summary Card */}
          <div className="payment-item-summary-card">
            <div className="item-thumb-wrapper">
              <img
                src={product?.mainImage}
                alt={product?.name}
                className="item-thumb-img"
              />
              <span className="item-grade-badge">⚜️ {product?.appraisalGrade || 'GRADE MASTERPIECE'}</span>
            </div>
            <div className="item-info-stack">
              <span className="item-brand-tag">{brandName} · {heroYear} A.D.</span>
              <strong className="item-title">{product?.name}</strong>
              <span className="item-latin">{product?.latinName}</span>
              <div className="item-specs-preview">
                <span>규격: {product?.dimensions || '높이 210mm × 폭 120mm'}</span>
                <span>원산지: {origin}</span>
              </div>
              <div className="item-valuation-row">
                <span className="val-lbl">공식 추정 감정가</span>
                <strong className="val-amt">{product?.value}</strong>
              </div>
            </div>
          </div>

          {/* 2. Payment Plan Selection */}
          <div className="payment-section-box">
            <div className="section-title-row">
              <span className="sec-glyph">📜</span>
              <span className="sec-title">소장 결제 금액 플랜 선택</span>
            </div>

            <div className="payment-plan-grid three-col">
              {/* Option A: Full Payment */}
              <label className={'plan-card ' + (paymentPlan === 'full' ? 'active' : '')}>
                <input
                  type="radio"
                  name="paymentPlan"
                  value="full"
                  checked={paymentPlan === 'full'}
                  onChange={() => setPaymentPlan('full')}
                />
                <div className="plan-meta">
                  <strong className="plan-name">전액 완납</strong>
                  <span className="plan-desc">카드 일시불/무이자 할부</span>
                  <span className="plan-amount">₩ {fullPrice.toLocaleString()}</span>
                </div>
                <span className="plan-badge">정가</span>
              </label>

              {/* Option B: VIP Deposit 10% */}
              <label className={'plan-card ' + (paymentPlan === 'deposit' ? 'active' : '')}>
                <input
                  type="radio"
                  name="paymentPlan"
                  value="deposit"
                  checked={paymentPlan === 'deposit'}
                  onChange={() => setPaymentPlan('deposit')}
                />
                <div className="plan-meta">
                  <strong className="plan-name">VIP 계약금 (10%)</strong>
                  <span className="plan-desc">예치금 결제 후 실물 잔금</span>
                  <span className="plan-amount gold">₩ {depositPrice.toLocaleString()}</span>
                </div>
                <span className="plan-badge gold">추천</span>
              </label>

              {/* Option C: 100 KRW Real Live Test */}
              <label className={'plan-card ' + (paymentPlan === 'test100' ? 'active' : '')}>
                <input
                  type="radio"
                  name="paymentPlan"
                  value="test100"
                  checked={paymentPlan === 'test100'}
                  onChange={() => setPaymentPlan('test100')}
                />
                <div className="plan-meta">
                  <strong className="plan-name">실 결제 검증</strong>
                  <span className="plan-desc">내 카드로 100원 실 결제</span>
                  <span className="plan-amount test">₩ 100</span>
                </div>
                <span className="plan-badge test">실 테스트</span>
              </label>
            </div>
          </div>

          {/* 3. Buyer & Delivery Information */}
          <div className="payment-section-box">
            <div className="section-title-row">
              <span className="sec-glyph">🏛️</span>
              <span className="sec-title">주문자 및 수령 정보</span>
            </div>

            <div className="buyer-form-grid">
              <div className="form-row half">
                <label className="field-label">수집가 성함 / 귀하 *</label>
                <input
                  type="text"
                  name="buyerName"
                  required
                  className="field-input"
                  value={formData.buyerName}
                  onChange={handleInputChange}
                  placeholder="성함을 입력하세요"
                />
              </div>

              <div className="form-row half">
                <label className="field-label">연락처 *</label>
                <input
                  type="tel"
                  name="buyerPhone"
                  required
                  className="field-input"
                  value={formData.buyerPhone}
                  onChange={handleInputChange}
                  placeholder="010-0000-0000"
                />
              </div>

              <div className="form-row full">
                <label className="field-label">수령 및 전달 방식 *</label>
                <div className="delivery-type-cluster">
                  <button
                    type="button"
                    className={'deliv-btn ' + (deliveryType === 'direct' ? 'active' : '')}
                    onClick={() => setDeliveryType('direct')}
                  >
                    🚚 전담 감정사 보안 특송 (무료 안심 보험)
                  </button>
                  <button
                    type="button"
                    className={'deliv-btn ' + (deliveryType === 'visit' ? 'active' : '')}
                    onClick={() => setDeliveryType('visit')}
                  >
                    🏛️ 라벨르지안 수장고 VIP 직접 수령
                  </button>
                </div>
              </div>

              {deliveryType === 'direct' && (
                <div className="form-row full">
                  <label className="field-label">보안 특송 배송지 주소 *</label>
                  <input
                    type="text"
                    name="deliveryAddress"
                    required
                    className="field-input"
                    value={formData.deliveryAddress}
                    onChange={handleInputChange}
                    placeholder="안전하게 전달받으실 주소를 입력하세요"
                  />
                </div>
              )}

              <div className="form-row full">
                <label className="field-label">수집가 전언 및 특별 요청 사항 (선택)</label>
                <input
                  type="text"
                  name="orderMemo"
                  className="field-input"
                  value={formData.orderMemo}
                  onChange={handleInputChange}
                  placeholder="희망 전달 일시 또는 특별 포장 요청"
                />
              </div>
            </div>
          </div>

          {/* 4. Payment Method Selection */}
          <div className="payment-section-box">
            <div className="section-title-row">
              <span className="sec-glyph">💳</span>
              <span className="sec-title">결제 수단 선택</span>
            </div>

            <div className="payment-methods-tab-cluster">
              <button
                type="button"
                className={'method-tab ' + (paymentMethod === 'CARD' ? 'active' : '')}
                onClick={() => setPaymentMethod('CARD')}
              >
                <span className="icon">💳</span>
                <span className="name">신용 / 체크카드</span>
              </button>

              <button
                type="button"
                className={'method-tab kakao ' + (paymentMethod === 'KAKAOPAY' ? 'active' : '')}
                onClick={() => setPaymentMethod('KAKAOPAY')}
              >
                <span className="icon">🟡</span>
                <span className="name">카카오페이</span>
              </button>

              <button
                type="button"
                className={'method-tab toss ' + (paymentMethod === 'TOSSPAY' ? 'active' : '')}
                onClick={() => setPaymentMethod('TOSSPAY')}
              >
                <span className="icon">🔵</span>
                <span className="name">토스페이</span>
              </button>

              <button
                type="button"
                className={'method-tab naver ' + (paymentMethod === 'NAVERPAY' ? 'active' : '')}
                onClick={() => setPaymentMethod('NAVERPAY')}
              >
                <span className="icon">🟢</span>
                <span className="name">네이버페이</span>
              </button>

              <button
                type="button"
                className={'method-tab v-account ' + (paymentMethod === 'VIRTUAL_ACCOUNT' ? 'active' : '')}
                onClick={() => setPaymentMethod('VIRTUAL_ACCOUNT')}
              >
                <span className="icon">🏦</span>
                <span className="name">가상계좌 (에스크로)</span>
              </button>
            </div>
          </div>

          {errorMessage && (
            <div className="payment-error-banner">
              ⚠️ {errorMessage}
            </div>
          )}

          {/* Bottom Fixed Action Submit Bar */}
          <div className="payment-submit-dock">
            <div className="dock-price-stack">
              <span className="dock-label">
                {paymentPlan === 'deposit' ? 'VIP 안심 계약금 (10%)' : (paymentPlan === 'test100' ? '실 결제 검증 금액' : '최종 결제 금액')}
              </span>
              <strong className="dock-amount">₩ {activeAmount.toLocaleString()}</strong>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="payment-execute-btn antique-wood-cta"
            >
              <span className="btn-glyph">⚜</span>
              <span className="btn-text">
                {isLoading ? '토스 결제창 호출 중...' : `₩ ${activeAmount.toLocaleString()} 결제창 열기 ➔`}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
