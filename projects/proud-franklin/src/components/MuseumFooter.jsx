import React, { useState } from "react";
import PolicyModals from "./PolicyModals";

export default function MuseumFooter() {
  const [activeModal, setActiveModal] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  return (
    <>
      {/* 1. Sleek Non-blocking Compact Bottom Bar */}
      <footer className="museum-slim-footer-bar">
        <div className="slim-footer-content">
          <div className="slim-brand-info">
            <span className="slim-crest">🏛️</span>
            <strong className="slim-name">라벨르지안 (La Belle Jian)</strong>
            <span className="slim-sep">|</span>
            <span className="slim-item">대표: 정지안</span>
            <span className="slim-sep">|</span>
            <span className="slim-item">사업자: 295-66-00531</span>
            <span className="slim-sep">|</span>
            <span className="slim-item">고객센터: 010-3795-5869</span>
          </div>

          <div className="slim-actions">
            <button
              type="button"
              className="slim-detail-trigger-btn"
              onClick={() => setIsDetailOpen(true)}
            >
              <span className="btn-shield">🛡️</span>
              <span>사업자 정보 & 에스크로 인증</span>
              <span className="arrow">➔</span>
            </button>
          </div>
        </div>
      </footer>

      {/* 2. Full Business Entity & Escrow Modal (When clicked) */}
      {isDetailOpen && (
        <div className="business-detail-modal-backdrop" onClick={() => setIsDetailOpen(false)}>
          <div className="business-detail-panel parchment-surface" onClick={e => e.stopPropagation()}>
            <div className="detail-modal-header">
              <div className="modal-title-group">
                <img
                  src="/assets/brand/emblem_gold_only.png"
                  alt="LA BELLE JIAN"
                  className="modal-gold-emblem"
                />
                <div>
                  <span className="modal-sub">ARCHIVUM BUSINESS ENTITY & ESCROW</span>
                  <h3 className="modal-title">라벨르지안 사업자 등록 및 구매안전 에스크로 정보</h3>
                </div>
              </div>
              <button
                type="button"
                className="detail-close-btn"
                onClick={() => setIsDetailOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className="detail-modal-scroll">
              {/* Escrow Banner */}
              <div className="detail-escrow-card">
                <div className="escrow-icon">🛡️</div>
                <div>
                  <h4 className="escrow-card-title">토스페이먼츠(Toss Payments) 정식 구매안전 에스크로 가입</h4>
                  <p className="escrow-card-p">
                    라벨르지안은 전자상거래법 제24조에 따라 고객님의 결제 대금을 안전하게 보호하며, 물품 수령 및 검수 완료 시까지 제3자 에스크로 예치를 적용합니다.
                  </p>
                </div>
              </div>

              {/* Business Info Grid */}
              <div className="detail-info-grid">
                <div className="detail-col">
                  <h5 className="col-heading">사업자 등록 기본 정보</h5>
                  <ul className="detail-list">
                    <li><span className="k">상호명 :</span> <strong className="v">라벨르지안 (La Belle Jian)</strong></li>
                    <li><span className="k">대표자 :</span> <strong className="v">정지안</strong></li>
                    <li><span className="k">사업자등록번호 :</span> <strong className="v gold">295-66-00531</strong> (일반과세자 / 부평세무서)</li>
                    <li><span className="k">사업장 소재지 :</span> <span className="v">인천광역시 부평구 주부토로 236, B동 126호 (갈산동, 인천테크노밸리U1센터)</span></li>
                    <li><span className="k">개업연월일 :</span> <span className="v">2022년 04월 05일</span></li>
                    <li><span className="k">업태 및 종목 :</span> <span className="v">도매 및 소매업 / 예술품 및 골동품 소매업, 전자상거래 소매업, SNS마켓</span></li>
                    <li><span className="k">호스팅 제공 :</span> <span className="v">Google Firebase (Hosting Cloud Engine)</span></li>
                  </ul>
                </div>

                <div className="detail-col">
                  <h5 className="col-heading">VIP 고객센터 및 안내</h5>
                  <ul className="detail-list">
                    <li><span className="k">고객센터 / 직통 :</span> <strong className="v gold">010-3795-5869</strong></li>
                    <li><span className="k">공식 대표 이메일 :</span> <strong className="v">kyoung4283@naver.com</strong></li>
                    <li><span className="k">상담 운영시간 :</span> <span className="v">평일 10:00 ~ 18:00 (VIP 수집가 1:1 상담 예약제)</span></li>
                    <li><span className="k">수장고 방문 영견 :</span> <span className="v">인천 부평 라벨르지안 수장고 (사전 예약 필수)</span></li>
                    <li><span className="k">결제 대행사 :</span> <span className="v">토스페이먼츠(주) (Toss Payments Co., Ltd.)</span></li>
                  </ul>
                </div>
              </div>

              {/* Policy Buttons */}
              <div className="detail-policies-dock">
                <span className="policy-dock-title">전자상거래 법적 정책 및 소비자보호 규정 :</span>
                <div className="policy-btn-group">
                  <button type="button" onClick={() => setActiveModal("terms")}>서비스 이용약관</button>
                  <button type="button" className="highlight" onClick={() => setActiveModal("privacy")}>개인정보처리방침</button>
                  <button type="button" onClick={() => setActiveModal("refund")}>환불 및 청약철회 규정</button>
                  <button type="button" onClick={() => setActiveModal("escrow")}>에스크로 구매안전인증서</button>
                </div>
              </div>
            </div>

            <div className="detail-modal-footer">
              <span className="copyright-txt">© 2022-2026 LA BELLE JIAN. ALL RIGHTS RESERVED.</span>
              <button
                type="button"
                className="detail-confirm-btn"
                onClick={() => setIsDetailOpen(false)}
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Policy Modals */}
      {activeModal && (
        <PolicyModals
          type={activeModal}
          onClose={() => setActiveModal(null)}
        />
      )}
    </>
  );
}
