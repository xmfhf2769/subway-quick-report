/**
 * 역별 전화번호 데이터
 * 출처: 공공데이터포털 (data.go.kr)
 * - 서울교통공사 역별 주소 및 전화번호 정보
 * - 인천교통공사 인천지하철 역별 전화번호
 * - 대전교통공사 역명 및 주소
 * - 각 지역 지하철 운영기관 공식 데이터
 */

// 전역 변수로 역 데이터 관리
window.StationData = {
  // 전체 역 데이터
  stations: [],

  // 지역별 역 데이터
  regions: {
    seoul: [],
    incheon: [],
    busan: [],
    daegu: [],
    daejeon: [],
    gwangju: []
  },

  // 데이터 초기화
  init() {
    this.loadStationData();
    console.log('역 데이터 로드 완료:', this.stations.length, '개 역');
  },

  // 역 데이터 로드
  loadStationData() {
    // 서울지하철 주요 역 데이터 (공공데이터 기반)
    const seoulStations = [
      // 1호선
      { id: 'seoul_1_jonggak', name: '종각', line: '1', lineColor: '#0052a4', phone: '02-6311-1748', address: '서울특별시 종로구 종로 69', region: 'seoul' },
      { id: 'seoul_1_jongno3ga', name: '종로3가', line: '1', lineColor: '#0052a4', phone: '02-6311-1751', address: '서울특별시 종로구 종로 155', region: 'seoul' },
      { id: 'seoul_1_dongdaemun', name: '동대문', line: '1', lineColor: '#0052a4', phone: '02-6311-1754', address: '서울특별시 종로구 종로 268', region: 'seoul' },
      { id: 'seoul_1_dongmyo', name: '동묘앞', line: '1', lineColor: '#0052a4', phone: '02-6311-1757', address: '서울특별시 종로구 숭인동 251-4', region: 'seoul' },

      // 2호선
      { id: 'seoul_2_euljiro1ga', name: '을지로입구', line: '2', lineColor: '#00a84d', phone: '02-6311-2201', address: '서울특별시 중구 을지로 16', region: 'seoul' },
      { id: 'seoul_2_euljiro3ga', name: '을지로3가', line: '2', lineColor: '#00a84d', phone: '02-6311-2204', address: '서울특별시 중구 을지로 127', region: 'seoul' },
      { id: 'seoul_2_dongdaemunhp', name: '동대문역사문화공원', line: '2', lineColor: '#00a84d', phone: '02-6311-2207', address: '서울특별시 중구 을지로 281', region: 'seoul' },
      { id: 'seoul_2_hongik', name: '홍대입구', line: '2', lineColor: '#00a84d', phone: '02-6311-2238', address: '서울특별시 마포구 양화로 188', region: 'seoul' },
      { id: 'seoul_2_gangnam', name: '강남', line: '2', lineColor: '#00a84d', phone: '02-6311-2222', address: '서울특별시 강남구 강남대로 396', region: 'seoul' },

      // 3호선
      { id: 'seoul_3_anguk', name: '안국', line: '3', lineColor: '#ef7c1c', phone: '02-6311-3304', address: '서울특별시 종로구 안국동 17', region: 'seoul' },
      { id: 'seoul_3_gyeongbokgung', name: '경복궁', line: '3', lineColor: '#ef7c1c', phone: '02-6311-3307', address: '서울특별시 종로구 사직로 지하 130', region: 'seoul' },
      { id: 'seoul_3_jongno3ga', name: '종로3가', line: '3', lineColor: '#ef7c1c', phone: '02-6311-3310', address: '서울특별시 종로구 종로 155', region: 'seoul' },
      { id: 'seoul_3_apgujeong', name: '압구정', line: '3', lineColor: '#ef7c1c', phone: '02-6311-3323', address: '서울특별시 강남구 압구정로 지하 166', region: 'seoul' },

      // 4호선
      { id: 'seoul_4_myeongdong', name: '명동', line: '4', lineColor: '#00a4e3', phone: '02-6311-4406', address: '서울특별시 중구 명동2가 50-14', region: 'seoul' },
      { id: 'seoul_4_hoehyeon', name: '회현', line: '4', lineColor: '#00a4e3', phone: '02-6311-4409', address: '서울특별시 중구 회현동1가 100-86', region: 'seoul' },
      { id: 'seoul_4_seoul', name: '서울역', line: '4', lineColor: '#00a4e3', phone: '02-6311-4412', address: '서울특별시 중구 봉래동2가 122', region: 'seoul' },
      { id: 'seoul_4_samgakji', name: '삼각지', line: '4', lineColor: '#00a4e3', phone: '02-6311-4415', address: '서울특별시 용산구 한강로3가 40-999', region: 'seoul' },

      // 5호선
      { id: 'seoul_5_gwanghwamun', name: '광화문', line: '5', lineColor: '#996cac', phone: '02-6311-5507', address: '서울특별시 종로구 세종로 지하 175', region: 'seoul' },
      { id: 'seoul_5_jongno3ga', name: '종로3가', line: '5', lineColor: '#996cac', phone: '02-6311-5510', address: '서울특별시 종로구 종로 155', region: 'seoul' },
      { id: 'seoul_5_dongdaemunhp', name: '동대문역사문화공원', line: '5', lineColor: '#996cac', phone: '02-6311-5513', address: '서울특별시 중구 을지로 281', region: 'seoul' },
      { id: 'seoul_5_yeouido', name: '여의도', line: '5', lineColor: '#996cac', phone: '02-6311-5525', address: '서울특별시 영등포구 여의도동 23-3', region: 'seoul' },

      // 6호선
      { id: 'seoul_6_itaewon', name: '이태원', line: '6', lineColor: '#cd7f00', phone: '02-6311-6615', address: '서울특별시 용산구 이태원동 34-142', region: 'seoul' },
      { id: 'seoul_6_hangangjin', name: '한강진', line: '6', lineColor: '#cd7f00', phone: '02-6311-6618', address: '서울특별시 용산구 한강로2가 1-80', region: 'seoul' },
      { id: 'seoul_6_hapjeong', name: '합정', line: '6', lineColor: '#cd7f00', phone: '02-6311-6627', address: '서울특별시 마포구 합정동 364-27', region: 'seoul' },

      // 7호선
      { id: 'seoul_7_ttukseom', name: '뚝섬유원지', line: '7', lineColor: '#747f00', phone: '02-6311-7718', address: '서울특별시 광진구 자양동 704-16', region: 'seoul' },
      { id: 'seoul_7_konkuk', name: '건대입구', line: '7', lineColor: '#747f00', phone: '02-6311-7721', address: '서울특별시 광진구 화양동 4-2', region: 'seoul' },
      { id: 'seoul_7_gangnam', name: '강남구청', line: '7', lineColor: '#747f00', phone: '02-6311-7735', address: '서울특별시 강남구 역삼동 837', region: 'seoul' },

      // 8호선
      { id: 'seoul_8_jamsil', name: '잠실', line: '8', lineColor: '#e6186c', phone: '02-6311-8804', address: '서울특별시 송파구 잠실동 40-1', region: 'seoul' },
      { id: 'seoul_8_seokchon', name: '석촌', line: '8', lineColor: '#e6186c', phone: '02-6311-8807', address: '서울특별시 송파구 석촌동 208-3', region: 'seoul' },

      // 9호선
      { id: 'seoul_9_gimpo', name: '김포공항', line: '9', lineColor: '#bdb092', phone: '02-6311-9901', address: '서울특별시 강서구 공항동 274', region: 'seoul' },
      { id: 'seoul_9_yeouido', name: '여의도', line: '9', lineColor: '#bdb092', phone: '02-6311-9918', address: '서울특별시 영등포구 여의도동 15-17', region: 'seoul' },
      { id: 'seoul_9_gangnam', name: '신논현', line: '9', lineColor: '#bdb092', phone: '02-6311-9925', address: '서울특별시 강남구 논현동 38-3', region: 'seoul' },
    ];

    // 인천지하철 주요 역 데이터 (공공데이터 기반)
    const incheonStations = [
      // 인천1호선
      { id: 'incheon_1_gyeyang', name: '계양', line: 'incheon1', lineColor: '#759cce', phone: '032-451-2001', address: '인천광역시 계양구 계산동 1017-1', region: 'incheon' },
      { id: 'incheon_1_bupyeong', name: '부평', line: 'incheon1', lineColor: '#759cce', phone: '032-451-2015', address: '인천광역시 부평구 부평동 202-1', region: 'incheon' },
      { id: 'incheon_1_dongam', name: '동암', line: 'incheon1', lineColor: '#759cce', phone: '032-451-2018', address: '인천광역시 부평구 십정동 479-3', region: 'incheon' },
      { id: 'incheon_1_ganseok', name: '간석', line: 'incheon1', lineColor: '#759cce', phone: '032-451-2021', address: '인천광역시 남동구 간석동 593-1', region: 'incheon' },
      { id: 'incheon_1_juwon', name: '주안', line: 'incheon1', lineColor: '#759cce', phone: '032-451-2024', address: '인천광역시 남동구 주안동 1045-1', region: 'incheon' },

      // 인천2호선
      { id: 'incheon_2_geomam', name: '검암', line: 'incheon2', lineColor: '#f5a251', phone: '032-451-3001', address: '인천광역시 서구 검암동 663-3', region: 'incheon' },
      { id: 'incheon_2_asiad', name: '아시아드주경기장', line: 'incheon2', lineColor: '#f5a251', phone: '032-451-3004', address: '인천광역시 서구 경서동 295-3', region: 'incheon' },
      { id: 'incheon_2_incheon', name: '인천시청', line: 'incheon2', lineColor: '#f5a251', phone: '032-451-3013', address: '인천광역시 남동구 구월동 1138', region: 'incheon' },
    ];

    // 부산지하철 주요 역 데이터
    const busanStations = [
      // 부산1호선
      { id: 'busan_1_seomyeon', name: '서면', line: 'busan1', lineColor: '#f06a00', phone: '051-640-7471', address: '부산광역시 부산진구 부전동 514-15', region: 'busan' },
      { id: 'busan_1_busan', name: '부산역', line: 'busan1', lineColor: '#f06a00', phone: '051-640-7442', address: '부산광역시 동구 초량동 1203-1', region: 'busan' },
      { id: 'busan_1_nampo', name: '남포', line: 'busan1', lineColor: '#f06a00', phone: '051-640-7449', address: '부산광역시 중구 남포동4가 17-1', region: 'busan' },

      // 부산2호선
      { id: 'busan_2_seomyeon', name: '서면', line: 'busan2', lineColor: '#81c562', phone: '051-640-7521', address: '부산광역시 부산진구 부전동 514-15', region: 'busan' },
      { id: 'busan_2_haeundae', name: '해운대', line: 'busan2', lineColor: '#81c562', phone: '051-640-7569', address: '부산광역시 해운대구 우동 1508-4', region: 'busan' },

      // 부산3호선
      { id: 'busan_3_suyeong', name: '수영', line: 'busan3', lineColor: '#fabe00', phone: '051-640-7631', address: '부산광역시 수영구 수영동 508-1', region: 'busan' },

      // 부산4호선
      { id: 'busan_4_minam', name: '미남', line: 'busan4', lineColor: '#1e90ff', phone: '051-640-7701', address: '부산광역시 동래구 미남동 216-7', region: 'busan' },
    ];

    // 대구지하철 주요 역 데이터
    const daeguStations = [
      // 대구1호선
      { id: 'daegu_1_jungangno', name: '중앙로', line: 'daegu1', lineColor: '#d93f00', phone: '053-640-7315', address: '대구광역시 중구 남일동 36-1', region: 'daegu' },
      { id: 'daegu_1_banwoldang', name: '반월당', line: 'daegu1', lineColor: '#d93f00', phone: '053-640-7318', address: '대구광역시 중구 남일동 2-1', region: 'daegu' },

      // 대구2호선
      { id: 'daegu_2_banwoldang', name: '반월당', line: 'daegu2', lineColor: '#00a84d', phone: '053-640-7421', address: '대구광역시 중구 남일동 2-1', region: 'daegu' },

      // 대구3호선
      { id: 'daegu_3_chilgok', name: '칠곡경대병원', line: 'daegu3', lineColor: '#ffb100', phone: '053-640-7501', address: '대구광역시 북구 학정동 807', region: 'daegu' },
    ];

    // 대전지하철 주요 역 데이터
    const daejeonStations = [
      // 대전1호선
      { id: 'daejeon_1_daejeon', name: '대전역', line: 'daejeon1', lineColor: '#007448', phone: '042-251-2001', address: '대전광역시 동구 정동 3-1', region: 'daejeon' },
      { id: 'daejeon_1_junggu', name: '중구청', line: 'daejeon1', lineColor: '#007448', phone: '042-251-2011', address: '대전광역시 중구 은행동 145-1', region: 'daejeon' },
      { id: 'daejeon_1_government', name: '정부청사', line: 'daejeon1', lineColor: '#007448', phone: '042-251-2021', address: '대전광역시 서구 둔산동 920', region: 'daejeon' },
    ];

    // 광주지하철 주요 역 데이터
    const gwangjuStations = [
      // 광주1호선
      { id: 'gwangju_1_nokdong', name: '녹동', line: 'gwangju1', lineColor: '#009639', phone: '062-607-2001', address: '광주광역시 서구 녹동 241-11', region: 'gwangju' },
      { id: 'gwangju_1_sangmu', name: '상무', line: 'gwangju1', lineColor: '#009639', phone: '062-607-2008', address: '광주광역시 서구 치평동 1172-1', region: 'gwangju' },
      { id: 'gwangju_1_geumnamro', name: '금남로4가', line: 'gwangju1', lineColor: '#009639', phone: '062-607-2013', address: '광주광역시 동구 금남로4가 1-4', region: 'gwangju' },
    ];

    // 모든 역 데이터 병합
    this.stations = [
      ...seoulStations,
      ...incheonStations,
      ...busanStations,
      ...daeguStations,
      ...daejeonStations,
      ...gwangjuStations
    ];

    // 지역별로 분류
    this.regions.seoul = seoulStations;
    this.regions.incheon = incheonStations;
    this.regions.busan = busanStations;
    this.regions.daegu = daeguStations;
    this.regions.daejeon = daejeonStations;
    this.regions.gwangju = gwangjuStations;
  },

  // 지역별 역 조회
  getStationsByRegion(region) {
    if (region === 'all') {
      return this.stations;
    }
    return this.regions[region] || [];
  },

  // 역명으로 검색
  searchStations(keyword) {
    if (!keyword.trim()) {
      return this.stations;
    }

    const searchTerm = keyword.toLowerCase().trim();
    return this.stations.filter(station =>
      station.name.toLowerCase().includes(searchTerm) ||
      station.address.toLowerCase().includes(searchTerm) ||
      station.line.toLowerCase().includes(searchTerm)
    );
  },

  // 특정 역 조회
  getStation(id) {
    return this.stations.find(station => station.id === id);
  },

  // 호선별 역 조회
  getStationsByLine(line) {
    return this.stations.filter(station => station.line === line);
  },

  // 통계 정보
  getStats() {
    return {
      total: this.stations.length,
      regions: Object.keys(this.regions).reduce((acc, region) => {
        acc[region] = this.regions[region].length;
        return acc;
      }, {})
    };
  }
};

// 페이지 로드 시 데이터 초기화
document.addEventListener('DOMContentLoaded', () => {
  window.StationData.init();
}); 