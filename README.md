# 🚇 지하철 호선별 문자 신고 시스템 (Subway Quick Report)

사용자가 지하철 호선을 선택하면 해당 운영기관의 고객센터 번호로 자동 문자 전송이 가능한 모바일 최적화 웹 애플리케이션입니다.

## 📱 주요 기능

- **호선 선택**: 지역별(서울/부산/대전 등) 탭으로 분리된 지하철 호선 선택
- **자동 문자 전송**: SMS URI 스키마를 통한 모바일 문자 앱 자동 연동
- **모바일 최적화**: 반응형 디자인으로 모바일/태블릿 최적화
- **접근성 지원**: 스크린 리더 및 키보드 네비게이션 지원
- **PWA 기능**: 오프라인 사용 가능 및 앱 설치 지원
- **다크모드**: 사용자 시스템 설정에 따른 자동 다크모드 지원

## 🛠 기술 스택

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Framework**: Vanilla JS (경량화)
- **CSS**: Modern CSS (Grid, Flexbox, CSS Variables)
- **PWA**: Service Worker, Web App Manifest
- **Build Tools**: ESLint, Prettier
- **배포**: GitHub Pages

## 🚀 시작하기

### 필수 조건

- Node.js 16+ 
- npm 또는 yarn

### 설치 및 실행

```bash
# 저장소 클론
git clone https://github.com/sigmaboy/subway-quick-report.git
cd subway-quick-report

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

개발 서버는 `http://localhost:3000`에서 실행됩니다.

### 빌드 및 배포

```bash
# 코드 품질 검사 및 포맷팅
npm run build

# GitHub Pages 배포
npm run deploy
```

## 📁 프로젝트 구조

```
subway-quick-report/
├── src/
│   ├── index.html          # 메인 HTML 파일
│   ├── css/
│   │   ├── main.css        # 메인 스타일시트
│   │   └── components.css  # 컴포넌트 스타일
│   ├── js/
│   │   ├── app.js          # 메인 애플리케이션 로직
│   │   ├── sms.js          # SMS 기능
│   │   └── data.js         # 데이터 관리
│   └── assets/
│       ├── icons/          # 아이콘 파일들
│       └── images/         # 이미지 파일들
├── data/
│   └── subway-lines.json   # 지하철 호선 데이터
├── public/
│   ├── manifest.json       # PWA 매니페스트
│   └── sw.js              # 서비스 워커
└── docs/                  # 문서
```

## 📊 지원 지역 및 호선

### 서울특별시
- 1~9호선, 공항철도, 신분당선, 경의중앙선 등

### 부산광역시  
- 1~4호선, 동해선, 김해경전철

### 대전광역시
- 1호선

### 대구광역시
- 1~3호선

## 🔐 보안 및 개인정보

- 사용자 휴대폰 번호를 수집하지 않습니다
- HTTPS를 통한 안전한 통신
- 개인정보 비수집 정책 준수

## 🧪 테스트

```bash
# 코드 품질 검사
npm run lint

# 코드 포맷팅
npm run format
```

## 📝 라이선스

MIT License - 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 문의

프로젝트 관련 문의: [GitHub Issues](https://github.com/sigmaboy/subway-quick-report/issues)

---

**⚠️ 주의사항**: 이 앱은 모바일 환경에서 최적화되어 있으며, SMS 기능은 모바일 디바이스에서만 정상 작동합니다. 