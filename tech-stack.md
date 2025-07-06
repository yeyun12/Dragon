# Dragon Flight Web - 기술 스택

## 개발 환경
- 단일 HTML 파일 구조 (HTML + CSS + JavaScript)
- 모던 웹 브라우저 지원 (Chrome, Firefox, Safari, Edge)

## 핵심 기술
### 1. 게임 엔진
- [Phaser.js](https://phaser.io/) v3.90.0
  - 무료 오픈소스 HTML5 게임 엔진
  - 강력한 2D 게임 개발 기능 제공
  - 활성화된 커뮤니티와 풍부한 문서
  - 모바일 터치 지원
  - 물리 엔진 내장
  - 스프라이트 및 애니메이션 시스템
  - 사운드 관리 시스템

### 2. 렌더링
- WebGL (기본)
- Canvas (WebGL 미지원 시 폴백)

### 3. 스타일링
- CSS3
  - Flexbox 레이아웃
  - CSS 애니메이션
  - 반응형 디자인

### 4. 프로그래밍
- JavaScript (ES6+)
  - 클래스 기반 객체지향 프로그래밍
  - 모듈 패턴
  - 게임 상태 관리

## 주요 기능 구현
1. 게임 시스템
   - Phaser.Scene을 활용한 스테이지 관리
   - Phaser.GameObjects를 활용한 게임 오브젝트 관리
   - Phaser.Physics를 활용한 충돌 감지

2. 렌더링 최적화
   - 스프라이트 시트 사용
   - 오브젝트 풀링
   - 화면 외 오브젝트 자동 정리

3. 입력 처리
   - 키보드 이벤트
   - 모바일 터치 이벤트
   - 반응형 컨트롤

4. 사운드
   - 배경음악
   - 효과음
   - 동적 사운드 로딩

## 개발 도구
- Visual Studio Code (권장 에디터)
- Chrome DevTools (디버깅)
- 웹 서버 (로컬 개발용, e.g. Live Server)

## 배포
- GitHub Pages 또는 정적 웹 호스팅
- CDN 사용 (Phaser.js 로딩)
- 에셋 최적화 및 압축 