import React, { useState } from "react";
import { sound } from "./AudioEngine";

export default function WaxSealModal({ book, type, onClose }) {
  const [stamped, setStamped] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    inquiryType: "소장 및 프라이빗 뷰잉 예약",
    message: ""
  });
  const [submitted, setSubmitted] = useState(false);

  const handleStamp = () => {
    sound.playSealStamp();
    setStamped(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sound.playSealStamp();
    setSubmitted(true);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-parchment-scroll" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button
          type="button"
          className="modal-close-btn"
          onClick={onClose}
          aria-label="닫기"
        >
          ✕
        </button>

        {/* Parchment Document Header */}
        <div className="scroll-ornament-top" />

        <div className="scroll-content">
          <div className="scroll-header">
            <span className="scroll-kicker">ARCHIVUM IMPERIALE • CERTIFICATUM</span>
            <h2 className="scroll-title">
              {type === "certificate" ? "공인 정품 감정 보증서" : "골동품 수집가 프라이빗 소장 문의"}
            </h2>
            <p className="scroll-latin">“Veritas et Aeternitas — 진실과 영원성을 보증함”</p>
          </div>

          <div className="scroll-divider" />

          {type === "certificate" ? (
            <div className="certificate-body">
              <div className="cert-grid">
                <div className="cert-item">
                  <span className="cert-label">성물 명칭</span>
                  <strong className="cert-val">{book.title} ({book.latinTitle})</strong>
                </div>
                <div className="cert-item">
                  <span className="cert-label">추정 연대</span>
                  <strong className="cert-val">{book.era}</strong>
                </div>
                <div className="cert-item">
                  <span className="cert-label">출토 / 제작지</span>
                  <strong className="cert-val">{book.origin}</strong>
                </div>
                <div className="cert-item">
                  <span className="cert-label">보존 등급</span>
                  <strong className="cert-val text-[#d4af37]">{book.appraisalGrade}</strong>
                </div>
                <div className="cert-item full-width">
                  <span className="cert-label">성물 규격 및 제원</span>
                  <p className="cert-desc">{book.dimensions} / {book.materials.join(", ")}</p>
                </div>
                <div className="cert-item full-width">
                  <span className="cert-label">소장 족보 (Provenance)</span>
                  <p className="cert-desc font-serif italic">{book.provenance}</p>
                </div>
              </div>

              {/* Interactive Wax Seal Stamping Area */}
              <div className="seal-stamp-zone">
                <div className="seal-text-area">
                  <p className="font-serif text-sm italic text-[#4a3b2c]">
                    본 문서는 옥스퍼드 고문서 보존 학회 및 아르카나 안티카 심의위원회의 엄격한 비파괴 금속·탄소 연대 측정과 역사적 사료 검증을 거친 진품임을 영구 보증합니다.
                  </p>
                  <span className="text-xs text-[#705e49] font-mono mt-1 block">
                    인증 고유 번호: CERT-{book.heroYear}-{book.slug.toUpperCase().slice(0, 3)}-994
                  </span>
                </div>

                <div className="seal-stamp-container">
                  <button
                    type="button"
                    className={`wax-seal-stamp ${stamped ? "is-stamped" : ""}`}
                    onClick={handleStamp}
                    disabled={stamped}
                    title="클릭하여 밀랍 인장 날인"
                  >
                    <div className="wax-body" style={{ backgroundColor: book.sealColor }}>
                      <span className="wax-rim" />
                      <span className="wax-insignia">ARCANA</span>
                      <span className="wax-year">{book.heroYear}</span>
                    </div>
                  </button>
                  <span className="stamp-hint">
                    {stamped ? "✓ 밀랍 인장 공인 날인 완료" : "인장을 눌러 공인 날인"}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* Inquiry Form */
            <div className="inquiry-body">
              {!submitted ? (
                <form onSubmit={handleSubmit} className="inquiry-form">
                  <p className="inquiry-lead">
                    희귀 골동품 <strong>[{book.title}]</strong>의 실물 감정 관람, 프라이빗 비딩 및 수석 큐레이터 1:1 상담을 원하시면 아래 양식을 작성해 주십시오.
                  </p>

                  <div className="form-grid">
                    <div className="form-field">
                      <label className="form-label">수집가 성명 / 귀하</label>
                      <input
                        type="text"
                        required
                        placeholder="예: 홍길동 님"
                        className="form-input"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                    <div className="form-field">
                      <label className="form-label">연락처 / 직통 번호</label>
                      <input
                        type="tel"
                        required
                        placeholder="010-0000-0000"
                        className="form-input"
                        value={formData.contact}
                        onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-field">
                    <label className="form-label">문의 목적</label>
                    <select
                      className="form-input"
                      value={formData.inquiryType}
                      onChange={(e) => setFormData({ ...formData, inquiryType: e.target.value })}
                    >
                      <option>소장 및 프라이빗 뷰잉 예약</option>
                      <option>학술 연구 및 대여 전시 협의</option>
                      <option>보유 골동품 교환 및 위탁 감정</option>
                      <option>기타 특별 요청</option>
                    </select>
                  </div>

                  <div className="form-field">
                    <label className="form-label">남기실 전언 (선택)</label>
                    <textarea
                      rows={3}
                      placeholder="희망 방문 일정 또는 특별 보존 조건 등을 적어주십시오."
                      className="form-input"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    />
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="submit-seal-btn">
                      <span className="btn-wax-dot" style={{ backgroundColor: book.sealColor }} />
                      <span>소장 서한 발송 및 상담 접수</span>
                    </button>
                  </div>
                </form>
              ) : (
                <div className="submitted-view">
                  <div className="submitted-seal" style={{ backgroundColor: book.sealColor }}>
                    <span>CONFIRMED</span>
                  </div>
                  <h3 className="text-xl font-bold text-[#3d2b1f] mb-2">
                    수집가 전언이 안전하게 봉인되어 전달되었습니다
                  </h3>
                  <p className="text-sm text-[#66503c] max-w-md mx-auto mb-6">
                    <strong>{formData.name}</strong> 님께 아르카나 안티카 수석 큐레이터가 직접 연락을 드려 프라이빗 열람 일정을 안내해 드리겠습니다.
                  </p>
                  <button type="button" className="close-action-btn" onClick={onClose}>
                    확인 및 서재로 복귀
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="scroll-ornament-bottom" />
      </div>
    </div>
  );
}
