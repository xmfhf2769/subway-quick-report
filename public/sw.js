/**
 * 지하철 신고 시스템 서비스 워커
 * 오프라인 지원 및 캐싱 기능을 제공합니다.
 */

const CACHE_NAME = 'subway-report-v1.0.0';
const STATIC_CACHE_NAME = `${CACHE_NAME}-static`;
const DYNAMIC_CACHE_NAME = `${CACHE_NAME}-dynamic`;

// 캐시할 정적 파일들
const STATIC_FILES = [
  '/',
  '/src/index.html',
  '/src/css/main.css',
  '/src/css/components.css',
  '/src/js/app.js',
  '/src/js/data.js',
  '/src/js/sms.js',
  '/data/subway-lines.json',
  '/public/manifest.json',
  'https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&display=swap'
];

// 동적 캐시할 파일 패턴
const DYNAMIC_CACHE_PATTERNS = [
  /\.(?:js|css|html|json)$/,
  /^https:\/\/fonts\./,
  /^https:\/\/cdn\./
];

// 설치 이벤트
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static files');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('[SW] Installation complete');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Installation failed:', error);
      })
  );
});

// 활성화 이벤트
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Activation complete');
        return self.clients.claim();
      })
  );
});

// 네트워크 요청 가로채기
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // 크롬 확장 프로그램 요청 무시
  if (url.protocol === 'chrome-extension:') {
    return;
  }

  // GET 요청만 캐싱
  if (request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          console.log('[SW] Serving from cache:', request.url);
          return cachedResponse;
        }

        // 네트워크에서 가져오기
        return fetch(request)
          .then((response) => {
            // 응답이 유효한지 확인
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // 동적 캐시에 저장할지 결정
            const shouldCache = DYNAMIC_CACHE_PATTERNS.some(pattern => 
              pattern.test(request.url)
            );

            if (shouldCache) {
              const responseToCache = response.clone();
              caches.open(DYNAMIC_CACHE_NAME)
                .then((cache) => {
                  console.log('[SW] Caching dynamic resource:', request.url);
                  cache.put(request, responseToCache);
                });
            }

            return response;
          })
          .catch((error) => {
            console.log('[SW] Network request failed:', request.url, error);
            
            // 오프라인 폴백
            if (request.destination === 'document') {
              return caches.match('/src/index.html');
            }
            
            // JSON 데이터 요청에 대한 폴백
            if (request.url.includes('subway-lines.json')) {
              return new Response(JSON.stringify({
                regions: {
                  seoul: {
                    name: '서울특별시',
                    lines: {
                      '1': {
                        name: '1호선',
                        operator: '한국철도공사',
                        phone: '1544-7788',
                        color: '#0052a4',
                        icon: '🚇'
                      }
                    }
                  }
                },
                messageTemplates: {
                  default: '[{line}] 고장 신고합니다.'
                }
              }), {
                headers: { 'Content-Type': 'application/json' }
              });
            }

            return new Response('오프라인 상태입니다.', {
              status: 503,
              statusText: 'Service Unavailable'
            });
          });
      })
  );
});

// 메시지 이벤트 (앱에서 서비스 워커로 메시지 전송)
self.addEventListener('message', (event) => {
  const { type, payload } = event.data;

  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'GET_VERSION':
      event.ports[0].postMessage({ version: CACHE_NAME });
      break;
      
    case 'CLEAR_CACHE':
      caches.delete(DYNAMIC_CACHE_NAME)
        .then(() => {
          event.ports[0].postMessage({ success: true });
        });
      break;
      
    case 'CACHE_URL':
      if (payload && payload.url) {
        caches.open(DYNAMIC_CACHE_NAME)
          .then((cache) => cache.add(payload.url))
          .then(() => {
            event.ports[0].postMessage({ success: true });
          });
      }
      break;
  }
});

// 푸시 알림 (추후 확장 가능)
self.addEventListener('push', (event) => {
  if (event.data) {
    const options = {
      body: event.data.text(),
      icon: '/assets/icons/icon-192x192.png',
      badge: '/assets/icons/badge-72x72.png',
      vibrate: [200, 100, 200],
      data: {
        timestamp: Date.now()
      },
      actions: [
        {
          action: 'open',
          title: '열기'
        },
        {
          action: 'close',
          title: '닫기'
        }
      ]
    };

    event.waitUntil(
      self.registration.showNotification('지하철 신고', options)
    );
  }
});

// 알림 클릭 처리
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// 백그라운드 동기화 (추후 확장 가능)
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // 백그라운드에서 수행할 작업
      console.log('[SW] Background sync triggered')
    );
  }
});

// 에러 핸들링
self.addEventListener('error', (event) => {
  console.error('[SW] Error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('[SW] Unhandled promise rejection:', event.reason);
  event.preventDefault();
});

// 디버그 정보 출력
console.log('[SW] Service Worker loaded');
console.log('[SW] Cache name:', CACHE_NAME);
console.log('[SW] Static files to cache:', STATIC_FILES.length); 