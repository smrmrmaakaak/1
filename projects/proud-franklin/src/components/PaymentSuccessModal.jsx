import React from 'react';
import { sound } from './AudioEngine';

export default function PaymentSuccessModal({ receipt, onClose }) {
  if (!receipt) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="payment-modal-backdrop" onClick={onClose}>
      <div className="payment-parchment-sheet success-sheet" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <header className="payment-sheet-header success-header">
          <div className="sheet-title-group">
            <span className="sheet-kicker">ARCHIVUM IMPERIALE • CONFIRMATIO POSSESSIONIS</span>
            <h2 className="sheet-title">성물 소장 승인서 & 공인 전자 영수증</h2>
            <span className="sheet-sub">라벨르지안 엔틱 감정원 공식 소장 원장 등록 완료</span>
          </div>
          <button
            type="button"
            className="payment-close-btn"
            onClick={onClose}
            aria-label="영수증 닫기"
          >
            ✕
          </button>
        </header>

        {/* Parchment Body */}
        <div className="payment-scroll-body success-body">
          {/* Imperial Crest / Stamp */}
          <div className="success-crest-badge">
            <span className="crest-icon">🏛️</span>
            <div className="crest-seal">
              <span>OFFICIALLY CERTIFIED</span>
            </div>
          </div>

          <div className="success-congrats-card">
            <h3 className="congrats-title">축하합니다, 귀하의 성물 소장이 공식 승인되었습니다</h3>
            <p className="congrats-desc">
              <strong>{receipt.buyerName}</strong> 귀하의 <strong>[{receipt.productName}]</strong> 소장 주문이
              라벨르지안 황실 안심 에스크로 결제망을 통해 성공적으로 완료되었습니다.
            </p>
          </div>

          {/* Official Transaction Receipt Table */}
          <div className="payment-section-box receipt-box">
            <div className="section-title-row">
              <span className="sec-glyph">📜</span>
              <span className="sec-title">공인 거래 영수 내역 (Charta Vectigalis)</span>
            </div>

            <div className="receipt-data-grid">
              <div className="receipt-row">
                <span className="k">공식 주문 번호</span>
                <strong className="v mono">{receipt.orderId}</strong>
              </div>
              <div className="receipt-row">
                <span className="k">소장 성물 명칭</span>
                <strong className="v">{receipt.productName}</strong>
              </div>
              <div className="receipt-row">
                <span className="k">발행 공방 / 브랜드</span>
                <strong className="v">{receipt.brandName}</strong>
              </div>
              <div className="receipt-row">
                <span className="k">결제 구분</span>
                <strong className="v gold">
                  {receipt.paymentPlan === 'deposit' ? 'VIP 안심 계약금 (10%)' : '성물 전액 완납'}
                </strong>
              </div>
              <div className="receipt-row">
                <span className="k">결제 수단</span>
                <strong className="v">{receipt.cardCompany}</strong>
              </div>
              <div className="receipt-row">
                <span className="k">승인 번호</span>
                <strong className="v mono">{receipt.apprNo}</strong>
              </div>
              <div className="receipt-row">
                <span className="k">승인 일시</span>
                <strong className="v">{receipt.approvedAt}</strong>
              </div>
              <div className="receipt-row highlight">
                <span className="k">실 결제 승인 금액</span>
                <strong className="v price">₩ {receipt.paidAmount.toLocaleString()}</strong>
              </div>
              <div className="receipt-row">
                <span className="k">수령 및 전달 방식</span>
                <strong className="v">{receipt.deliveryType === 'visit' ? '라벨르지안 수장고 VIP 직접 방문' : '전담 감정사 보안 직송'}</strong>
              </div>
              <div className="receipt-row">
                <span className="k">전달지 주소</span>
                <strong className="v address">{receipt.deliveryAddress}</strong>
              </div>
            </div>
          </div>

          {/* Next Steps VIP Guidance */}
          <div className="vip-concierge-card">
            <span className="concierge-glyph">⚜️</span>
            <div className="concierge-text">
              <strong>라벨르지안 VIP 전담 큐레이터 1:1 배정 안내</strong>
              <p>
                본 거래는 100% 진품 보증 및 도난·파손 보험이 적용됩니다. 결제 확인 후 24시간 내 수석 큐레이터가 직접 유선 연락을 드려 실물 인도 및 보증서 인계 일정을 확정해 드립니다.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="success-action-cluster">
            <button
              type="button"
              className="success-btn print"
              onClick={handlePrint}
            >
              🖨️ 영수증 및 소장 증서 인쇄 / PDF 저장
            </button>
            <button
              type="button"
              className="success-btn confirm antique-wood-cta"
              onClick={onClose}
            >
              <span>확인 및 도감으로 복귀 ➔</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
