/**
 * 지하철 신고 시스템 메인 애플리케이션
 * UI 이벤트 처리 및 전체 애플리케이션 로직을 관리합니다.
 */

/* global subwayData, smsManager, showLoading, showError, showSuccess */

class SubwayApp {
  constructor() {
    this.currentRegion = 'seoul';
    this.isInitialized = false;
  }

  /**
   * 애플리케이션을 초기화합니다.
   */
  async init() {
    if (this.isInitialized) {
      return;
    }

    try {
      console.log('지하철 신고 시스템 초기화 시작...');

      // 데이터 로드
      await this.loadData();

      // UI 초기화
      this.initializeUI();

      // 이벤트 리스너 설정
      this.setupEventListeners();

      // 첫 번째 지역 표시
      this.showRegion(this.currentRegion);

      this.isInitialized = true;
      console.log('애플리케이션 초기화 완료');

      // showSuccess('앱이 준비되었습니다!'); // 불필요한 초기화 메시지 제거
    } catch (error) {
      console.error('애플리케이션 초기화 실패:', error);
      showError('앱을 시작하는 중 오류가 발생했습니다.');
    }
  }

  /**
   * 문자 예시 미리보기의 시간을 실시간으로 업데이트합니다.
   */
  startMessagePreviewUpdater() {
    const updatePreviewTime = () => {
      const datePreview = document.getElementById('datePreview');
      if (datePreview) {
        const now = new Date();
        const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        datePreview.textContent = timeStr;
      }
    };

    // 즉시 업데이트
    updatePreviewTime();

    // 1분마다 업데이트
    setInterval(updatePreviewTime, 60000);
  }

  /**
   * 데이터를 로드합니다.
   */
  async loadData() {
    showLoading(true);
    try {
      await subwayData.loadData();
      console.log('지하철 데이터 로드 완료');
    } catch (error) {
      console.error('데이터 로드 실패:', error);
      throw new Error('지하철 데이터를 불러올 수 없습니다.');
    } finally {
      showLoading(false);
    }
  }

  /**
   * UI를 초기화합니다.
   */
  initializeUI() {
    // 지역 탭 생성
    this.createRegionTabs();

    // 디바이스 체크
    this.checkDevice();

    // 접근성 설정
    this.setupAccessibility();
  }

  /**
   * 지역 탭을 생성합니다.
   */
  createRegionTabs() {
    const tabsContainer = document.querySelector('.region-tabs');
    if (!tabsContainer) {
      return;
    }

    // 기존 탭 제거
    tabsContainer.innerHTML = '';

    const regions = subwayData.getAllRegions();
    Object.entries(regions).forEach(([regionId, regionData]) => {
      const button = document.createElement('button');
      button.className = `tab-button ${regionId === this.currentRegion ? 'active' : ''}`;
      button.setAttribute('role', 'tab');
      button.setAttribute('aria-selected', regionId === this.currentRegion ? 'true' : 'false');
      button.setAttribute('aria-controls', `${regionId}-panel`);
      button.setAttribute('data-region', regionId);
      button.textContent = regionData.name.replace('광역시', '').replace('특별시', '');

      tabsContainer.appendChild(button);
    });
  }

  /**
   * 지역별 호선을 표시합니다.
   */
  showRegion(regionId) {
    const lines = subwayData.getRegionLines(regionId);
    const panelId = `${regionId}-panel`;
    let panel = document.getElementById(panelId);

    // 패널이 없으면 생성
    if (!panel) {
      panel = this.createRegionPanel(regionId);
    }

    // 모든 패널 숨기기
    document.querySelectorAll('.tab-panel').forEach(p => {
      p.classList.remove('active');
    });

    // 현재 패널 표시
    panel.classList.add('active');

    // 호선 버튼 생성
    this.createLineButtons(regionId, lines, panel);

    // 현재 지역 업데이트
    this.currentRegion = regionId;

    // 탭 활성화 상태 업데이트
    this.updateTabStates(regionId);
  }

  /**
   * 지역 패널을 생성합니다.
   */
  createRegionPanel(regionId) {
    const panelsContainer = document.querySelector('.tab-panels');
    const panel = document.createElement('div');

    panel.id = `${regionId}-panel`;
    panel.className = 'tab-panel';
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', `${regionId}-tab`);

    const gridContainer = document.createElement('div');
    gridContainer.className = 'line-grid';
    gridContainer.id = `${regionId}-lines`;

    panel.appendChild(gridContainer);
    panelsContainer.appendChild(panel);

    return panel;
  }

  /**
   * 호선 버튼을 생성합니다.
   */
  createLineButtons(regionId, lines, panel) {
    const gridContainer = panel.querySelector('.line-grid');
    gridContainer.innerHTML = '';

    if (Object.keys(lines).length === 0) {
      this.showEmptyState(gridContainer, regionId);
      return;
    }

    Object.entries(lines).forEach(([lineId, lineData]) => {
      const button = this.createLineButton(regionId, lineId, lineData);
      gridContainer.appendChild(button);
    });
  }

  /**
   * 개별 호선 버튼을 생성합니다.
   */
  createLineButton(regionId, lineId, lineData) {
    const button = document.createElement('button');
    button.className = 'line-btn';
    button.setAttribute('data-region', regionId);
    button.setAttribute('data-line', lineId);
    button.setAttribute('data-phone', lineData.phone);
    button.setAttribute('aria-label', `${lineData.name} 신고하기`);

    // 접근성을 위한 키보드 지원
    button.setAttribute('tabindex', '0');

    button.innerHTML = `
      <div class="line-info">
        <div class="line-number">
          <span class="line-icon">${lineData.icon}</span>
          ${lineData.name}
        </div>
        <div class="line-operator">${lineData.operator}</div>
        <div class="line-phone">${lineData.phone}</div>
      </div>
      <div class="line-action">
        ✉️
      </div>
    `;

    return button;
  }

  /**
   * 빈 상태를 표시합니다.
   */
  showEmptyState(container, regionId) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🚇</div>
        <div class="empty-state-title">호선 정보 없음</div>
        <div class="empty-state-description">
          ${regionId} 지역의 지하철 정보가 준비 중입니다.
        </div>
      </div>
    `;
  }

  /**
   * 탭 활성화 상태를 업데이트합니다.
   */
  updateTabStates(activeRegionId) {
    document.querySelectorAll('.tab-button').forEach(tab => {
      const regionId = tab.getAttribute('data-region');
      const isActive = regionId === activeRegionId;

      tab.classList.toggle('active', isActive);
      tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
  }

  /**
   * 이벤트 리스너를 설정합니다.
   */
  setupEventListeners() {
    // 지역 탭 클릭
    document.addEventListener('click', (event) => {
      if (event.target.classList.contains('tab-button')) {
        const regionId = event.target.getAttribute('data-region');
        this.showRegion(regionId);
      }
    });

    // 호선 버튼 클릭
    document.addEventListener('click', (event) => {
      if (event.target.closest('.line-btn')) {
        const button = event.target.closest('.line-btn');
        this.handleLineClick(button);
      }
    });

    // 키보드 네비게이션
    document.addEventListener('keydown', (event) => {
      this.handleKeyNavigation(event);
    });



    // 윈도우 리사이즈
    window.addEventListener('resize', () => {
      this.handleResize();
    });

    // 온라인/오프라인 상태
    window.addEventListener('online', () => {
      showSuccess('인터넷 연결이 복구되었습니다.');
    });

    window.addEventListener('offline', () => {
      showError('인터넷 연결이 끊어졌습니다. 일부 기능이 제한될 수 있습니다.');
    });
  }

  /**
   * 호선 버튼 클릭을 처리합니다.
   */
  async handleLineClick(button) {
    const regionId = button.getAttribute('data-region');
    const lineId = button.getAttribute('data-line');

    // 버튼 애니메이션
    button.style.transform = 'scale(0.95)';
    setTimeout(() => {
      button.style.transform = '';
    }, 150);

    // SMS 전송
    await smsManager.sendSMS(regionId, lineId);
  }

  /**
   * 키보드 네비게이션을 처리합니다.
   */
  handleKeyNavigation(event) {
    // Tab 키로 포커스 이동 지원
    if (event.key === 'Enter' || event.key === ' ') {
      if (event.target.classList.contains('line-btn')) {
        event.preventDefault();
        this.handleLineClick(event.target);
      } else if (event.target.classList.contains('tab-button')) {
        event.preventDefault();
        const regionId = event.target.getAttribute('data-region');
        this.showRegion(regionId);
      }
    }

    // 화살표 키로 탭 네비게이션
    if (event.target.classList.contains('tab-button')) {
      this.handleTabKeyNavigation(event);
    }
  }

  /**
   * 탭 키보드 네비게이션을 처리합니다.
   */
  handleTabKeyNavigation(event) {
    const tabs = Array.from(document.querySelectorAll('.tab-button'));
    const currentIndex = tabs.indexOf(event.target);

    let newIndex = currentIndex;

    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
      event.preventDefault();
    } else if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      newIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
      event.preventDefault();
    }

    if (newIndex !== currentIndex) {
      tabs[newIndex].focus();
    }
  }

  /**
   * 디바이스를 확인하고 적절한 UI를 표시합니다.
   */
  checkDevice() {
    const deviceType = smsManager.getDeviceType();
    const desktopNotice = document.querySelector('.device-notice.desktop-only');

    if (deviceType === 'desktop' && desktopNotice) {
      desktopNotice.style.display = 'block';
    }

    // 모바일에서만 SMS 기능 활성화
    if (deviceType !== 'mobile') {
      document.querySelectorAll('.line-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          showError('SMS 기능은 모바일 디바이스에서만 사용할 수 있습니다.');
        });
      });
    }
  }

  /**
   * 접근성을 설정합니다.
   */
  setupAccessibility() {
    // 스크린 리더를 위한 라이브 영역 설정
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    liveRegion.id = 'live-region';
    document.body.appendChild(liveRegion);

    // 포커스 관리
    this.manageFocus();
  }

  /**
   * 포커스를 관리합니다.
   */
  manageFocus() {
    // 페이지 로드 시 첫 번째 탭으로 포커스 이동
    setTimeout(() => {
      const firstTab = document.querySelector('.tab-button');
      if (firstTab) {
        firstTab.focus();
      }
    }, 500);
  }

  /**
   * 윈도우 리사이즈를 처리합니다.
   */
  handleResize() {
    // 모바일 뷰포트 높이 조정
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  }

  /**
   * 라이브 영역에 메시지를 announce합니다.
   */
  announceToScreenReader(message) {
    const liveRegion = document.getElementById('live-region');
    if (liveRegion) {
      liveRegion.textContent = message;
    }
  }
}



// 전역 앱 인스턴스
const app = new SubwayApp();

// DOM 로드 완료 시 앱 초기화
document.addEventListener('DOMContentLoaded', () => {
  app.init();
});

// 모듈 익스포트 (ES6 모듈 환경에서 사용 시)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SubwayApp, app };
}