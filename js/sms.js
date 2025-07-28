/**
 * SMS 발송 기능 모듈
 * SMS URI 스키마를 통한 문자 전송 기능을 제공합니다.
 */

/* global subwayData, showSuccess, showError */

class SMSManager {
  constructor() {
    this.currentTemplate = 'default';
    this.messageHistory = [];
    this.maxHistorySize = 10;
  }

  /**
   * SMS URI 스키마를 생성합니다.
   * @param {string} phoneNumber - 전화번호
   * @param {string} message - 메시지 내용
   * @returns {string} SMS URI
   */
  createSMSURI(phoneNumber, message) {
    // 전화번호 정규화 (하이픈 제거)
    const normalizedPhone = this.normalizePhoneNumber(phoneNumber);

    // 메시지 URL 인코딩
    const encodedMessage = encodeURIComponent(message);

    return `sms:${normalizedPhone}?body=${encodedMessage}`;
  }

  /**
   * 전화번호를 정규화합니다.
   * @param {string} phoneNumber - 원본 전화번호
   * @returns {string} 정규화된 전화번호
   */
  normalizePhoneNumber(phoneNumber) {
    if (!phoneNumber) {
      throw new Error('전화번호가 제공되지 않았습니다.');
    }

    // 하이픈, 공백, 괄호 제거
    return phoneNumber.replace(/[-\s()]/g, '');
  }

  /**
   * 메시지 템플릿을 생성합니다.
   * @param {string} lineName - 호선명
   * @param {string} templateType - 템플릿 타입
   * @param {string} customMessage - 사용자 정의 메시지 (선택적)
   * @returns {string} 완성된 메시지
   */
  createMessage(lineName, templateType = 'default', customMessage = '') {
    let template = subwayData.getMessageTemplate(templateType);

    // 커스텀 메시지 처리
    if (templateType === 'custom' && customMessage) {
      template = template.replace('{message}', customMessage);
    }

    // 호선명 치환
    const message = template.replace('{line}', lineName);

    // 메시지 히스토리에 추가
    this.addToHistory({
      lineName,
      templateType,
      message,
      timestamp: new Date().toISOString()
    });

    return message;
  }

  /**
   * SMS 전송을 시도합니다.
   * @param {string} regionId - 지역 ID
   * @param {string} lineId - 호선 ID
   * @param {string} templateType - 템플릿 타입
   * @param {string} customMessage - 사용자 정의 메시지
   * @returns {Promise<boolean>} 전송 성공 여부
   */
  async sendSMS(regionId, lineId, templateType = 'default', customMessage = '') {
    try {
      // 호선 정보 가져오기
      const lineInfo = subwayData.getLineInfo(regionId, lineId);
      if (!lineInfo) {
        throw new Error('호선 정보를 찾을 수 없습니다.');
      }

      // 디바이스 지원 여부 확인
      if (!this.isSMSSupported()) {
        throw new Error('이 디바이스에서는 SMS 기능을 지원하지 않습니다.');
      }

      // 메시지 생성
      const message = this.createMessage(lineInfo.name, templateType, customMessage);

      // SMS URI 생성
      const smsURI = this.createSMSURI(lineInfo.phone, message);

      console.log('SMS URI 생성:', smsURI);

      // SMS 앱 열기
      window.location.href = smsURI;

      // 성공 메시지 표시
      showSuccess(`${lineInfo.name} 신고 문자가 준비되었습니다.`);

      // 분석 데이터 전송 (익명)
      this.trackSMSUsage(regionId, lineId, templateType);

      return true;
    } catch (error) {
      console.error('SMS 전송 실패:', error);
      showError(error.message);
      return false;
    }
  }

  /**
   * SMS 지원 여부를 확인합니다.
   * @returns {boolean} SMS 지원 여부
   */
  isSMSSupported() {
    // 모바일 디바이스 감지
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

    // SMS URI 스키마 지원 여부 (기본적으로 모든 모바일에서 지원)
    return isMobile;
  }

  /**
   * 디바이스 타입을 확인합니다.
   * @returns {string} 디바이스 타입 (mobile, tablet, desktop)
   */
  getDeviceType() {
    const userAgent = navigator.userAgent;

    if (/iPad|Android(?!.*Mobile)/i.test(userAgent)) {
      return 'tablet';
    }

    if (/iPhone|iPod|Android.*Mobile|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
      return 'mobile';
    }

    return 'desktop';
  }

  /**
   * 메시지 히스토리에 추가합니다.
   * @param {Object} messageData - 메시지 데이터
   */
  addToHistory(messageData) {
    this.messageHistory.unshift(messageData);

    // 최대 크기 제한
    if (this.messageHistory.length > this.maxHistorySize) {
      this.messageHistory = this.messageHistory.slice(0, this.maxHistorySize);
    }

    // 로컬 스토리지에 저장
    this.saveHistory();
  }

  /**
   * 메시지 히스토리를 로컬 스토리지에 저장합니다.
   */
  saveHistory() {
    try {
      localStorage.setItem('subway-sms-history', JSON.stringify(this.messageHistory));
    } catch (error) {
      console.warn('히스토리 저장 실패:', error);
    }
  }

  /**
   * 메시지 히스토리를 로컬 스토리지에서 로드합니다.
   */
  loadHistory() {
    try {
      const saved = localStorage.getItem('subway-sms-history');
      if (saved) {
        this.messageHistory = JSON.parse(saved);
      }
    } catch (error) {
      console.warn('히스토리 로드 실패:', error);
      this.messageHistory = [];
    }
  }

  /**
   * 메시지 히스토리를 반환합니다.
   * @returns {Array} 메시지 히스토리 배열
   */
  getHistory() {
    return [...this.messageHistory];
  }

  /**
   * 히스토리를 초기화합니다.
   */
  clearHistory() {
    this.messageHistory = [];
    this.saveHistory();
  }

  /**
   * SMS 사용량을 추적합니다 (익명).
   * @param {string} regionId - 지역 ID
   * @param {string} lineId - 호선 ID
   * @param {string} templateType - 템플릿 타입
   */
  trackSMSUsage(regionId, lineId, templateType) {
    try {
      // 익명 사용량 통계를 위한 간단한 로깅
      const usage = {
        region: regionId,
        line: lineId,
        template: templateType,
        timestamp: Date.now(),
        userAgent: navigator.userAgent.substring(0, 50), // 축약된 정보만
        deviceType: this.getDeviceType()
      };

      console.log('SMS 사용량 기록:', usage);

      // 로컬 통계 업데이트
      this.updateLocalStats(regionId, lineId);
    } catch (error) {
      console.warn('사용량 추적 실패:', error);
    }
  }

  /**
   * 로컬 통계를 업데이트합니다.
   * @param {string} regionId - 지역 ID
   * @param {string} lineId - 호선 ID
   */
  updateLocalStats(regionId, lineId) {
    try {
      const stats = JSON.parse(localStorage.getItem('subway-stats') || '{}');

      // 지역별 통계
      if (!stats[regionId]) {
        stats[regionId] = {};
      }

      // 호선별 통계
      if (!stats[regionId][lineId]) {
        stats[regionId][lineId] = 0;
      }

      stats[regionId][lineId]++;

      localStorage.setItem('subway-stats', JSON.stringify(stats));
    } catch (error) {
      console.warn('로컬 통계 업데이트 실패:', error);
    }
  }

  /**
   * 로컬 통계를 반환합니다.
   * @returns {Object} 통계 데이터
   */
  getLocalStats() {
    try {
      return JSON.parse(localStorage.getItem('subway-stats') || '{}');
    } catch (error) {
      console.warn('통계 로드 실패:', error);
      return {};
    }
  }

  /**
   * 전화번호 유효성을 검사합니다.
   * @param {string} phoneNumber - 전화번호
   * @returns {boolean} 유효성 여부
   */
  validatePhoneNumber(phoneNumber) {
    if (!phoneNumber) {
      return false;
    }

    const normalized = this.normalizePhoneNumber(phoneNumber);

    // 한국 전화번호 패턴 검사
    const patterns = [
      /^1[0-9]{3}[0-9]{4}$/, // 1XXX-XXXX (고객센터)
      /^0[2-9][0-9]{7,8}$/, // 지역번호
      /^01[0-9][0-9]{7,8}$/ // 휴대폰
    ];

    return patterns.some(pattern => pattern.test(normalized));
  }

  /**
   * 메시지 길이를 검사합니다.
   * @param {string} message - 메시지
   * @returns {Object} 검사 결과
   */
  validateMessageLength(message) {
    const length = message.length;
    const maxLength = 2000; // SMS 최대 길이 (실제로는 더 짧을 수 있음)

    return {
      isValid: length <= maxLength,
      length,
      maxLength,
      remaining: maxLength - length
    };
  }
}

// 전역 인스턴스 생성
const smsManager = new SMSManager();

// 초기화 시 히스토리 로드
document.addEventListener('DOMContentLoaded', () => {
  smsManager.loadHistory();
});

// 모듈 익스포트 (ES6 모듈 환경에서 사용 시)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SMSManager, smsManager };
} 