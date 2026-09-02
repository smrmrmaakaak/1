import React from "react";

export default function PolicyModals({ type, onClose }) {
  if (!type) return null;

  const modalData = {
    terms: {
      title: "라벨르지안 서비스 이용약관",
      latin: "CONVENTIO SERVITII IMPERIALIS",
      content: (
        <div className="policy-text-body">
          <p><strong>제1조 (목적)</strong><br />본 약관은 라벨르지안(이하 "수장고")이 운영하는 온라인 앤틱 도감 및 소장 플랫폼(이하 "서비스")에서 제공하는 전자상거래 및 관련 서비스의 이용 조건 및 절차를 규정함을 목적으로 합니다.</p>
          <p><strong>제2조 (용어의 정의)</strong><br />1. "이용자"란 본 서비스에 접속하여 본 약관에 따라 수장고가 제공하는 성물 도감 및 소장 서비스를 이용하는 회원 및 비회원을 말합니다.<br />2. "성물 및 수장품"이란 수장고가 정식 감정 및 실측을 완료하여 등록한 유럽 앤틱 포슬린, 피겨린 및 예술품을 의미합니다.</p>
          <p><strong>제3조 (거래 및 소장 계약)</strong><br />1. 이용자는 상품 상세 제원 및 5각 정밀 화보를 열람한 후 토스페이먼츠 안전 결제 시스템을 통해 일시불 완납 또는 10% 예치금 계약을 체결할 수 있습니다.<br />2. 모든 성물은 1:1 수석 감정사의 검수 증명서와 함께 안전 특송 또는 VIP 수장고 직접 수령 방식으로 전달됩니다.</p>
        </div>
      )
    },
    privacy: {
      title: "개인정보처리방침",
      latin: "POLITIA SECRETUM IMPERIALIS",
      content: (
        <div className="policy-text-body">
          <p><strong>1. 수집하는 개인정보 항목</strong><br />수장고는 안전한 성물 전달 및 정식 전자 결제를 위해 아래와 같은 개인정보를 처리합니다.<br />- 필수항목: 수집가 성명, 연락처, 배송지 주소, 결제 승인 내역</p>
          <p><strong>2. 개인정보의 수집 및 이용목적</strong><br />- 성물 소장 계약 체결 및 특송 배송<br />- 토스페이먼츠 정식 전자 영수증 발급 및 고객 응대<br />- 앤틱 소장 보증서 및 진품 이력 관리</p>
          <p><strong>3. 개인정보의 보유 및 파기</strong><br />전자상거래 등에서의 소비자보호에 관한 법률 등 관련 법령이 정한 기간 동안 보존 후 지체 없이 파기합니다.</p>
        </div>
      )
    },
    refund: {
      title: "환불 및 청약철회 규정",
      latin: "POLITIA REDDITIONIS & REFUNDATIONIS",
      content: (
        <div className="policy-text-body">
          <p><strong>1. 청약철회 및 반품 기간</strong><br />- 소비자는 성물을 수령한 날로부터 7일 이내에 청약철회(환불)를 요청할 수 있습니다.<br />- 표시·광고의 내용과 다르거나 계약 내용과 다르게 이행된 경우 30일 이내 환불이 가능합니다.</p>
          <p><strong>2. 반품 및 환불 절차</strong><br />- 앤틱 도자기의 특성상 파손 방지를 위해 라벨르지안 전담 특송을 통해 안전 회수 진행됩니다.<br />- 물품 회수 및 원본 감정 상태 확인 후 결제 수단(신용카드/카카오페이)으로 결제 취소 또는 즉시 전액 환불 처리됩니다.</p>
          <p><strong>3. 반품 배송비 규정</strong><br />- 단순 변심에 의한 반품의 경우 특송 보험 운임이 부과될 수 있으며, 작품 하자 시에는 수장고가 전액 부담합니다.</p>
        </div>
      )
    },
    escrow: {
      title: "토스페이먼츠 에스크로 구매안전인증",
      latin: "AUTHENTICATIO CUSTODIAE ESCROW",
      content: (
        <div className="policy-text-body">
          <div className="escrow-cert-box">
            <div className="cert-seal">🛡️ 100% ESCROW SAFE</div>
            <p><strong>토스페이먼츠(Toss Payments) 구매안전(에스크로) 서비스 가입</strong></p>
            <p>라벨르지안은 전자상거래 등에서의 소비자보호에 관한 법률 제24조에 의거하여 고객님의 결제 대금을 안전하게 보호하기 위해 <strong>토스페이먼츠의 구매안전(에스크로) 서비스</strong>에 정식 가입되어 있습니다.</p>
            <p>고객님이 결제하신 금액은 물품을 안전하게 수령하고 구매를 확정하실 때까지 토스페이먼츠가 제3자 예치 기관으로서 안전하게 보관합니다.</p>
          </div>
        </div>
      )
    }
  };

  const data = modalData[type] || modalData.terms;

  return (
    <div className="policy-modal-backdrop" onClick={onClose}>
      <div className="policy-modal-panel parchment-surface" onClick={e => e.stopPropagation()}>
        <div className="policy-modal-header">
          <div className="header-meta">
            <span className="p-latin">{data.latin}</span>
            <h3 className="p-title">{data.title}</h3>
          </div>
          <button type="button" className="policy-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="policy-divider" />

        <div className="policy-modal-scroll-body">
          {data.content}
        </div>

        <div className="policy-modal-footer">
          <button type="button" className="policy-confirm-btn" onClick={onClose}>
            확인 및 닫기
          </button>
        </div>
      </div>
    </div>
  );
}
