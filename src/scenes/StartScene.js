import Phaser from 'phaser';

export class StartScene extends Phaser.Scene {
    constructor() {
        super({ key: 'StartScene' });
    }

    create() {
        const { width, height } = this.scale;

        // 배경 그라데이션
        const background = this.add.graphics();
        background.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x16213e, 0x16213e, 1);
        background.fillRect(0, 0, width, height);

        // 게임 타이틀
        const title = this.add.text(width / 2, height / 4, 'Dragon Flight', {
            fontSize: '64px',
            fontFamily: 'Arial Black',
            fill: '#ffffff',
            stroke: '#4a4a8a',
            strokeThickness: 8,
            shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 2, stroke: true, fill: true }
        }).setOrigin(0.5);

        // 시작 버튼
        const startButton = this.createButton(width / 2, height / 2, '게임 시작', () => {
            this.scene.start('GameScene');
        });

        // 설정 버튼
        const settingsButton = this.createButton(width / 2, height / 2 + 80, '설정', () => {
            // TODO: 설정 메뉴 구현
            console.log('설정 메뉴 열기');
        });

        // 게임 설명
        this.add.text(width / 2, height - 100, '방향키로 이동, 스페이스바로 발사', {
            fontSize: '20px',
            fill: '#ffffff',
            backgroundColor: '#00000066',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5);

        // 버전 정보
        this.add.text(10, height - 30, 'v1.0.0', {
            fontSize: '16px',
            fill: '#ffffff66'
        });

        // 애니메이션 효과
        this.tweens.add({
            targets: title,
            y: height / 4 + 10,
            duration: 2000,
            ease: 'Sine.inOut',
            yoyo: true,
            repeat: -1
        });
    }

    createButton(x, y, text, callback) {
        const button = this.add.text(x, y, text, {
            fontSize: '32px',
            fill: '#ffffff',
            backgroundColor: '#4a4a8a',
            padding: { x: 30, y: 15 },
            borderRadius: 15
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', callback)
        .on('pointerover', () => {
            button.setStyle({ fill: '#ffd700' });
            button.setScale(1.1);
        })
        .on('pointerout', () => {
            button.setStyle({ fill: '#ffffff' });
            button.setScale(1);
        });

        return button;
    }
} 