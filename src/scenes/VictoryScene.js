export class VictoryScene extends Phaser.Scene {
    constructor() {
        super({ key: 'VictoryScene' });
    }

    init(data) {
        this.finalScore = data.score;
        this.timeElapsed = data.time;
    }

    create() {
        const { width, height } = this.scale;

        // 승리 텍스트
        this.add.text(width / 2, height / 2 - 100, '승리!', {
            fontSize: '64px',
            fill: '#ffd700',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // 최종 점수
        this.add.text(width / 2, height / 2, `최종 점수: ${this.finalScore}`, {
            fontSize: '32px',
            fill: '#ffffff'
        }).setOrigin(0.5);

        // 클리어 시간
        this.add.text(width / 2, height / 2 + 50, `클리어 시간: ${this.timeElapsed}초`, {
            fontSize: '32px',
            fill: '#ffffff'
        }).setOrigin(0.5);

        // 메인 메뉴 버튼
        const menuButton = this.add.text(width / 2, height / 2 + 150, '메인 메뉴', {
            fontSize: '24px',
            fill: '#ffffff',
            backgroundColor: '#222222',
            padding: { x: 20, y: 10 }
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
            this.scene.start('GameScene');
        })
        .on('pointerover', () => {
            menuButton.setStyle({ fill: '#ffd700' });
        })
        .on('pointerout', () => {
            menuButton.setStyle({ fill: '#ffffff' });
        });

        // 승리 효과
        this.createVictoryEffects();
    }

    createVictoryEffects() {
        // 파티클 효과
        const particles = this.add.particles(0, 0, 'particle', {
            x: { min: 0, max: this.scale.width },
            y: -10,
            quantity: 2,
            lifespan: 3000,
            gravityY: 200,
            scale: { start: 0.6, end: 0 },
            alpha: { start: 1, end: 0 },
            tint: [ 0xffff00, 0xff0000, 0x00ff00, 0x0000ff ],
            rotate: { min: 0, max: 360 }
        });
    }
} 