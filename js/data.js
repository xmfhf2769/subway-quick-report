/**
 * 지하철 데이터 관리 모듈
 * 지하철 호선 정보를 로드하고 관리하는 기능을 제공합니다.
 */

class SubwayDataManager {
  constructor() {
    this.data = null;
    this.isLoaded = false;
    this.loadPromise = null;
  }

  /**
   * 지하철 데이터를 로드합니다.
   * @returns {Promise<Object>} 지하철 데이터
   */
  async loadData() {
    if (this.isLoaded && this.data) {
      return this.data;
    }

    if (this.loadPromise) {
      return this.loadPromise;
    }

    this.loadPromise = this._fetchData();
    return this.loadPromise;
  }

  /**
   * 실제 데이터를 가져오는 내부 메서드
   * @private
   */
  async _fetchData() {
    try {
      showLoading(true);

      const response = await fetch('../data/subway-lines.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      this.data = await response.json();
      this.isLoaded = true;

      console.log('지하철 데이터 로드 완료:', this.data);
      return this.data;
    } catch (error) {
      console.error('지하철 데이터 로드 실패:', error);
      this._loadFallbackData();
      return this.data;
    } finally {
      showLoading(false);
    }
  }

  /**
   * 네트워크 실패 시 사용할 기본 데이터
   * @private
   */
  _loadFallbackData() {
    console.warn('기본 데이터를 사용합니다.');
    this.data = {
      regions: {
        seoul: {
          name: '서울특별시',
          lines: {
            '1': {
              name: '1호선',
              operator: '한국철도공사',
              phone: '1544-7788',
              color: '#0052a4',
              icon: '🚇',
              description: '의정부·동두천 ↔ 서울역 ↔ 인천·신창'
            },
            '2': {
              name: '2호선',
              operator: '서울교통공사',
              phone: '1577-1234',
              color: '#00a84d',
              icon: '🚇',
              description: '성수·신도림 순환선 및 신정지선'
            }
          }
        }
      },
      messageTemplates: {
        default: '[{line}] 고장 신고합니다.'
      }
    };
    this.isLoaded = true;
  }

  /**
   * 특정 지역의 호선 정보를 반환합니다.
   * @param {string} regionId - 지역 ID (seoul, busan, etc.)
   * @returns {Object} 호선 정보 객체
   */
  getRegionLines(regionId) {
    if (!this.isLoaded || !this.data) {
      console.warn('데이터가 아직 로드되지 않았습니다.');
      return {};
    }

    const region = this.data.regions[regionId];
    return region ? region.lines : {};
  }

  /**
   * 모든 지역 정보를 반환합니다.
   * @returns {Object} 지역 정보 객체
   */
  getAllRegions() {
    if (!this.isLoaded || !this.data) {
      return {};
    }
    return this.data.regions;
  }

  /**
   * 특정 호선의 정보를 반환합니다.
   * @param {string} regionId - 지역 ID
   * @param {string} lineId - 호선 ID
   * @returns {Object|null} 호선 정보 또는 null
   */
  getLineInfo(regionId, lineId) {
    const lines = this.getRegionLines(regionId);
    return lines[lineId] || null;
  }

  /**
   * 메시지 템플릿을 반환합니다.
   * @param {string} templateType - 템플릿 타입
   * @returns {string} 메시지 템플릿
   */
  getMessageTemplate(templateType = 'default') {
    if (!this.isLoaded || !this.data) {
      return '[{line}] 고장 신고합니다.';
    }

    return this.data.messageTemplates[templateType] ||
           this.data.messageTemplates.default;
  }

  /**
   * 호선별 색상을 반환합니다.
   * @param {string} regionId - 지역 ID
   * @param {string} lineId - 호선 ID
   * @returns {string} CSS 색상 값
   */
  getLineColor(regionId, lineId) {
    const lineInfo = this.getLineInfo(regionId, lineId);
    return lineInfo ? lineInfo.color : '#64748b';
  }

  /**
   * 검색 기능 - 호선명으로 검색
   * @param {string} query - 검색어
   * @returns {Array} 검색 결과 배열
   */
  searchLines(query) {
    if (!this.isLoaded || !this.data) {
      return [];
    }

    const results = [];
    const searchTerm = query.toLowerCase().trim();

    Object.entries(this.data.regions).forEach(([regionId, regionData]) => {
      Object.entries(regionData.lines).forEach(([lineId, lineData]) => {
        if (
          lineData.name.toLowerCase().includes(searchTerm) ||
          lineData.operator.toLowerCase().includes(searchTerm) ||
          lineData.description.toLowerCase().includes(searchTerm)
        ) {
          results.push({
            regionId,
            lineId,
            regionName: regionData.name,
            ...lineData
          });
        }
      });
    });

    return results;
  }

  /**
   * 데이터 유효성 검사
   * @returns {boolean} 데이터가 유효한지 여부
   */
  isDataValid() {
    if (!this.data) {
      return false;
    }

    try {
      return (
        this.data.regions &&
        typeof this.data.regions === 'object' &&
        Object.keys(this.data.regions).length > 0
      );
    } catch (error) {
      console.error('데이터 유효성 검사 실패:', error);
      return false;
    }
  }
}

// 전역 인스턴스 생성
const subwayData = new SubwayDataManager();

// 로딩 상태 관리 함수
function showLoading(show = true) {
  const loadingElement = document.getElementById('loading');
  if (loadingElement) {
    if (show) {
      loadingElement.classList.add('active');
      loadingElement.setAttribute('aria-hidden', 'false');
    } else {
      loadingElement.classList.remove('active');
      loadingElement.setAttribute('aria-hidden', 'true');
    }
  }
}

// 에러 처리 함수
function showError(message, type = 'error') {
  console.error(`[${type.toUpperCase()}]`, message);

  // 토스트 알림 표시
  showToast(message, type);
}

// 성공 메시지 표시
function showSuccess(message) {
  console.log('[SUCCESS]', message);
  showToast(message, 'success');
}

// 토스트 알림 표시 함수
function showToast(message, type = 'info') {
  // 기존 토스트 제거
  const existingToast = document.querySelector('.toast');
  if (existingToast) {
    existingToast.remove();
  }

  // 새 토스트 생성
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };

  toast.innerHTML = `
    <div class="toast-content">
      <span class="toast-icon">${icons[type] || icons.info}</span>
      <span class="toast-message">${message}</span>
      <button class="toast-close" aria-label="닫기">×</button>
    </div>
  `;

  document.body.appendChild(toast);

  // 애니메이션 표시
  setTimeout(() => toast.classList.add('show'), 100);

  // 닫기 버튼 이벤트
  const closeBtn = toast.querySelector('.toast-close');
  closeBtn.addEventListener('click', () => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  });

  // 자동 제거 (5초 후)
  setTimeout(() => {
    if (toast.parentNode) {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }
  }, 5000);
}

// 데이터 프리로드 함수
async function preloadSubwayData() {
  try {
    await subwayData.loadData();
    console.log('지하철 데이터 프리로드 완료');
  } catch (error) {
    console.error('데이터 프리로드 실패:', error);
  }
}

// 모듈 익스포트 (ES6 모듈 환경에서 사용 시)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    SubwayDataManager,
    subwayData,
    showLoading,
    showError,
    showSuccess,
    showToast
  };
} 