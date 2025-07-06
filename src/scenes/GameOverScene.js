export class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    init(data) {
        this.score = data.score;
    }

    create() {
        const { width, height } = this.scale;

        // 게임오버 텍스트
        this.add.text(width / 2, height / 2 - 50, 'GAME OVER', {
            fontSize: '48px',
            fill: '#ff0000',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // 점수 표시
        this.add.text(width / 2, height / 2 + 50, `점수: ${this.score}`, {
            fontSize: '32px',
            fill: '#ffffff'
        }).setOrigin(0.5);

        // 재시작 버튼
        const restartButton = this.add.text(width / 2, height / 2 + 150, '다시 시작', {
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
            restartButton.setStyle({ fill: '#ff0000' });
        })
        .on('pointerout', () => {
            restartButton.setStyle({ fill: '#ffffff' });
        });
    }
} 