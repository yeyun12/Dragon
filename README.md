# Dragon Flight Web Game

Phaser.js로 제작된 드래곤 플라이트 스타일의 웹 게임입니다.

## 게임 특징

- 5개의 스테이지와 보스 전투
- 다양한 아이템 시스템 (체력 회복, 레이저 빔, 더블 샷)
- 보스별 고유한 패턴과 난이도 상승
- 파티클 효과와 시각적 피드백
- 점수 시스템

## 게임 조작법

- 방향키: 이동
- 스페이스바: 발사
- ESC: 재시작 (게임오버/클리어 시)

## 기술 스택

- Phaser.js v3.90.0
- HTML5 / JavaScript
- Node.js

## 설치 및 실행 방법

1. 저장소 클론
```bash
git clone https://github.com/[your-username]/dragon-flight-web.git
cd dragon-flight-web
```

2. 의존성 설치
```bash
npm install
```

3. 개발 서버 실행
```bash
npm start
```

4. 브라우저에서 확인
```
http://localhost:8080
```

## 게임 기능

### 아이템
- ♥: 체력 회복 (50 HP)
- ▲: 레이저 빔 (5초간 강력한 공격)
- ◆: 더블 샷 (7초간 2발 동시 발사)

### 보스 패턴
- 지그재그 이동
- 원형 공격
- 러쉬 공격
- 나선형 탄막
- 텔레포트 후 8방향 공격
- 크로스파이어 패턴

## 라이선스

MIT License 