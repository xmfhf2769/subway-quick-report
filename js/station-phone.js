/**
 * 역별 전화번호 페이지 관리 클래스
 */
class StationPhoneManager {
  constructor() {
    this.searchQuery = '';
    this.selectedRegion = 'all';
    this.stations = [];
    this.filteredStations = [];
    this.searchDebounceTimer = null;

    // DOM 요소들
    this.elements = {
      searchInput: null,
      regionTabs: null,
      stationsGrid: null,
      stationsCount: null,
      loadingStations: null,
      noResults: null
    };
  }

  /**
   * 초기화
   */
  async init() {
    try {
      // DOM 요소 가져오기
      this.bindElements();
      
      // 데이터 로드
      await this.loadStations();
      
      // 이벤트 리스너 설정
      this.setupEventListeners();
      
      // 초기 화면 렌더링
      this.renderStations();
      
      console.log('Station Phone Manager 초기화 완료');
    } catch (error) {
      console.error('Station Phone Manager 초기화 실패:', error);
      showError('초기화 중 오류가 발생했습니다.');
    }
  }

  /**
   * DOM 요소 바인딩
   */
  bindElements() {
    this.elements.searchInput = document.getElementById('station-search');
    this.elements.regionTabs = document.querySelectorAll('.region-tab');
    this.elements.stationsGrid = document.getElementById('stations-grid');
    this.elements.stationsCount = document.getElementById('stations-count');
    this.elements.loadingStations = document.getElementById('loading-stations');
    this.elements.noResults = document.getElementById('no-results');
  }

  /**
   * 이벤트 리스너 설정
   */
  setupEventListeners() {
    // 검색 입력
    if (this.elements.searchInput) {
      this.elements.searchInput.addEventListener('input', (e) => {
        this.handleSearchInput(e.target.value);
      });
    }

    // 지역 탭
    this.elements.regionTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        this.handleRegionChange(tab.dataset.region);
      });
    });

    // 키보드 내비게이션
    document.addEventListener('keydown', (e) => {
      this.handleKeyboardNavigation(e);
    });
  }

  /**
   * 역 데이터 로드
   */
  async loadStations() {
    try {
      this.showLoading(true);
      
      // StationData에서 역 정보 가져오기
      if (typeof StationData !== 'undefined' && StationData.stations) {
        this.stations = StationData.stations;
        this.filteredStations = [...this.stations];
      } else {
        throw new Error('역 데이터를 찾을 수 없습니다.');
      }
      
      this.showLoading(false);
    } catch (error) {
      console.error('역 데이터 로드 실패:', error);
      this.showLoading(false);
      showError('역 데이터를 불러오는데 실패했습니다.');
    }
  }

  /**
   * 검색 입력 처리 (디바운스)
   */
  handleSearchInput(query) {
    this.searchQuery = query.trim();
    
    // 기존 타이머 취소
    if (this.searchDebounceTimer) {
      clearTimeout(this.searchDebounceTimer);
    }
    
    // 300ms 후 검색 실행
    this.searchDebounceTimer = setTimeout(() => {
      this.filterStations();
      this.renderStations();
    }, 300);
  }

  /**
   * 지역 변경 처리
   */
  handleRegionChange(region) {
    this.selectedRegion = region;
    
    // 탭 활성화 상태 업데이트
    this.elements.regionTabs.forEach(tab => {
      tab.classList.toggle('active', tab.dataset.region === region);
    });
    
    this.filterStations();
    this.renderStations();
  }

  /**
   * 역 목록 필터링
   */
  filterStations() {
    let filtered = [...this.stations];
    
    // 지역 필터링
    if (this.selectedRegion !== 'all') {
      filtered = filtered.filter(station => station.region === this.selectedRegion);
    }
    
    // 검색어 필터링
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(station => 
        station.name.toLowerCase().includes(query) ||
        station.line.toLowerCase().includes(query) ||
        station.address.toLowerCase().includes(query)
      );
    }
    
    this.filteredStations = filtered;
  }

  /**
   * 역 목록 렌더링
   */
  renderStations() {
    if (!this.elements.stationsGrid) return;
    
    // 카운트 업데이트
    if (this.elements.stationsCount) {
      this.elements.stationsCount.textContent = this.filteredStations.length;
    }
    
    // 결과가 없는 경우
    if (this.filteredStations.length === 0) {
      this.showNoResults(true);
      this.elements.stationsGrid.innerHTML = '';
      return;
    }
    
    this.showNoResults(false);
    
    // 역 카드 생성
    const stationCards = this.filteredStations.map(station => 
      this.createStationCard(station)
    ).join('');
    
    this.elements.stationsGrid.innerHTML = stationCards;
    
    // 버튼 이벤트 리스너 추가
    this.attachStationCardEvents();
  }

  /**
   * 역 카드 생성
   */
  createStationCard(station) {
    return `
      <div class="station-card" data-station-id="${station.id}">
        <div class="station-info">
          <h3 class="station-name">${station.name}</h3>
          <div class="station-details">
            <span class="station-line">${station.line}</span>
            <span class="station-phone">${station.phone}</span>
          </div>
          <div class="station-address">${station.address}</div>
        </div>
        <div class="station-actions">
          <button class="action-btn call-btn" data-action="call" data-phone="${station.phone}">
            📞 전화
          </button>
          <button class="action-btn sms-btn" data-action="sms" data-phone="${station.phone}">
            💬 문자
          </button>
          <button class="action-btn copy-btn" data-action="copy" data-phone="${station.phone}">
            📋 복사
          </button>
        </div>
      </div>
    `;
  }

  /**
   * 역 카드 이벤트 리스너 추가
   */
  attachStationCardEvents() {
    const actionButtons = document.querySelectorAll('.action-btn');
    
    actionButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        const action = button.dataset.action;
        const phone = button.dataset.phone;
        
        this.handleStationAction(action, phone);
      });
    });
  }

  /**
   * 역 액션 처리
   */
  handleStationAction(action, phone) {
    switch (action) {
      case 'call':
        this.makeCall(phone);
        break;
      case 'sms':
        this.sendSMS(phone);
        break;
      case 'copy':
        this.copyPhone(phone);
        break;
    }
  }

  /**
   * 전화 걸기
   */
  makeCall(phone) {
    try {
      window.location.href = `tel:${phone}`;
      showSuccess(`${phone}로 전화를 겁니다.`);
    } catch (error) {
      console.error('전화 걸기 실패:', error);
      showError('전화 걸기에 실패했습니다.');
    }
  }

  /**
   * 문자 보내기
   */
  sendSMS(phone) {
    try {
      const message = '안녕하세요. 문의사항이 있습니다.';
      window.location.href = `sms:${phone}?body=${encodeURIComponent(message)}`;
      showSuccess(`${phone}로 문자를 전송합니다.`);
    } catch (error) {
      console.error('문자 전송 실패:', error);
      showError('문자 전송에 실패했습니다.');
    }
  }

  /**
   * 전화번호 복사
   */
  async copyPhone(phone) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(phone);
      } else {
        // 폴백: textarea 사용
        const textArea = document.createElement('textarea');
        textArea.value = phone;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      
      showSuccess(`전화번호 ${phone}가 복사되었습니다.`);
    } catch (error) {
      console.error('복사 실패:', error);
      showError('전화번호 복사에 실패했습니다.');
    }
  }

  /**
   * 키보드 내비게이션 처리
   */
  handleKeyboardNavigation(event) {
    // Escape로 검색 초기화
    if (event.key === 'Escape' && this.elements.searchInput) {
      this.elements.searchInput.value = '';
      this.handleSearchInput('');
      this.elements.searchInput.blur();
    }
    
    // Enter로 첫 번째 결과 전화 걸기
    if (event.key === 'Enter' && this.filteredStations.length > 0) {
      const firstStation = this.filteredStations[0];
      this.makeCall(firstStation.phone);
    }
  }

  /**
   * 로딩 상태 표시
   */
  showLoading(isLoading) {
    if (this.elements.loadingStations) {
      this.elements.loadingStations.style.display = isLoading ? 'block' : 'none';
    }
    
    if (this.elements.stationsGrid) {
      this.elements.stationsGrid.style.display = isLoading ? 'none' : 'grid';
    }
  }

  /**
   * 결과 없음 상태 표시
   */
  showNoResults(show) {
    if (this.elements.noResults) {
      this.elements.noResults.style.display = show ? 'block' : 'none';
    }
  }
}

// 전역 인스턴스 생성
const stationPhoneManager = new StationPhoneManager();

// DOM 로드 완료 시 초기화
document.addEventListener('DOMContentLoaded', () => {
  stationPhoneManager.init();
});

// 모듈 익스포트
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { StationPhoneManager, stationPhoneManager };
} 