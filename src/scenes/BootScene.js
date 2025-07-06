import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        // 로딩 화면 설정
        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(240, 270, 320, 50);
        
        // 로딩 텍스트
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const loadingText = this.make.text({
            x: width / 2,
            y: height / 2 - 50,
            text: '로딩중...',
            style: {
                font: '20px monospace',
                fill: '#ffffff'
            }
        });
        loadingText.setOrigin(0.5, 0.5);

        // 로딩 프로그레스 이벤트
        this.load.on('progress', (value) => {
            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBar.fillRect(250, 280, 300 * value, 30);
        });
        
        this.load.on('complete', () => {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
        });
    }

    create() {
        // 임시 에셋 생성
        this.createTempAssets();
        
        // StartScene으로 전환
        this.scene.start('StartScene');
    }

    createTempAssets() {
        // 임시 플레이어 에셋
        const playerGraphics = this.add.graphics();
        playerGraphics.lineStyle(2, 0xffffff);
        playerGraphics.fillStyle(0x4444ff);
        playerGraphics.beginPath();
        // 삼각형 모양의 우주선
        playerGraphics.moveTo(0, -25);  // 상단 꼭지점
        playerGraphics.lineTo(20, 25);  // 우측 하단
        playerGraphics.lineTo(-20, 25); // 좌측 하단
        playerGraphics.closePath();
        playerGraphics.strokePath();
        playerGraphics.fillPath();
        playerGraphics.generateTexture('player', 50, 50);
        playerGraphics.destroy();

        // 임시 총알 에셋
        const bulletGraphics = this.add.graphics();
        bulletGraphics.fillStyle(0xffff00);
        bulletGraphics.fillCircle(5, 5, 3);
        bulletGraphics.generateTexture('bullet', 10, 10);
        bulletGraphics.destroy();
    }
} 