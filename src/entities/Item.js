import Phaser from 'phaser';

export class Item extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, type) {
        super(scene, x, y, 'item_' + type);
        
        this.scene = scene;
        this.type = type;
        
        // 아이템 종류별 설정
        this.itemConfigs = {
            health: {
                color: 0xff0000,
                effect: this.healthEffect.bind(this),
                value: 50,
                name: 'Health',
                scale: 1
            },
            laser: {
                color: 0x00ffff,
                effect: this.laserEffect.bind(this),
                duration: 5000,
                name: 'Laser Beam',
                scale: 1.2
            },
            double: {
                color: 0xffff00,
                effect: this.doubleEffect.bind(this),
                duration: 7000,
                name: 'Double Shot',
                scale: 1.1
            }
        };
        
        // 씬에 아이템 추가
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // 물리 속성 설정
        this.setCollideWorldBounds(true);
        this.setBounce(0.4);
        this.setGravityY(100);
        
        // 크기 설정
        const config = this.itemConfigs[this.type];
        if (config) {
            this.setScale(config.scale);
        }
        
        // 수명 설정 (10초)
        this.lifespan = 10000;
        this.createTime = Date.now();
        
        // 깜빡임 효과
        this.createBlinkEffect();
        
        // 플로팅 효과
        this.createFloatingEffect();
        
        // 아이템 이름 표시
        this.createItemLabel();
    }
    
    createItemGraphics() {
        const config = this.itemConfigs[this.type];
        if (!config) return;
        
        const size = 30;
        const graphics = this.scene.add.graphics();
        
        // 외부 원
        graphics.lineStyle(3, 0xffffff);
        graphics.strokeCircle(size/2, size/2, size/2);
        
        // 내부 원
        graphics.lineStyle(2, config.color);
        graphics.fillStyle(config.color, 0.5);
        graphics.fillCircle(size/2, size/2, size/2 - 3);
        
        // 아이템 심볼
        const text = this.scene.add.text(size/2, size/2, config.symbol, {
            fontSize: '20px',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            color: '#ffffff'
        }).setOrigin(0.5);
        
        // 텍스처 생성
        const renderTexture = this.scene.add.renderTexture(0, 0, size, size);
        renderTexture.draw([graphics, text]);
        renderTexture.saveTexture('item_' + this.type);
        
        // cleanup
        graphics.destroy();
        text.destroy();
        renderTexture.destroy();
        
        // 스프라이트 설정
        this.setTexture('item_' + this.type);
        this.setScale(config.scale);
    }
    
    createBlinkEffect() {
        // 수명이 3초 미만일 때 깜빡임
        this.scene.time.addEvent({
            delay: 200,
            callback: () => {
                const timeLeft = this.lifespan - (Date.now() - this.createTime);
                if (timeLeft < 3000) {
                    this.alpha = this.alpha === 1 ? 0.3 : 1;
                }
            },
            loop: true
        });
    }
    
    createFloatingEffect() {
        // 부드러운 상하 움직임
        this.scene.tweens.add({
            targets: this,
            y: this.y - 10,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        // 회전 효과
        this.scene.tweens.add({
            targets: this,
            angle: 360,
            duration: 3000,
            repeat: -1,
            ease: 'Linear'
        });
    }
    
    createItemLabel() {
        const config = this.itemConfigs[this.type];
        if (!config) return;
        
        // 아이템 이름 텍스트 생성
        this.label = this.scene.add.text(this.x, this.y + 25, config.name, {
            fontSize: '14px',
            fill: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 4, y: 2 }
        });
        this.label.setOrigin(0.5);
        
        // 라벨 업데이트 이벤트
        this.scene.events.on('update', () => {
            if (this.active && this.label) {
                this.label.setPosition(this.x, this.y + 25);
            }
        });
    }
    
    destroy() {
        if (this.label) {
            this.label.destroy();
        }
        super.destroy();
    }
    
    update() {
        // 수명 체크
        const timeLeft = this.lifespan - (Date.now() - this.createTime);
        if (timeLeft <= 0) {
            this.destroy();
            return;
        }
        
        // 화면 밖으로 나가면 제거
        if (this.y > this.scene.game.config.height + 50) {
            this.destroy();
        }
    }
    
    collect(player) {
        // 이펙트 생성
        const config = this.itemConfigs[this.type];
        if (!config) return;
        
        const particles = this.scene.add.particles(0, 0, 'particle', {
            x: this.x,
            y: this.y,
            speed: { min: 50, max: 100 },
            scale: { start: 0.4, end: 0 },
            blendMode: 'ADD',
            tint: config.color,
            lifespan: 500,
            quantity: 20
        });
        
        // 아이템 획득 텍스트 효과
        const collectText = this.scene.add.text(this.x, this.y - 20, config.name, {
            fontSize: '16px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
        
        // 텍스트 애니메이션
        this.scene.tweens.add({
            targets: collectText,
            y: collectText.y - 50,
            alpha: 0,
            duration: 1000,
            ease: 'Power2',
            onComplete: () => collectText.destroy()
        });
        
        // 효과음 재생 (나중에 추가)
        // this.scene.sound.play('item_collect');
        
        // 아이템 효과 적용
        if (config.effect) {
            config.effect(player);
        }
        
        // 파티클 제거 타이머
        this.scene.time.delayedCall(500, () => {
            particles.destroy();
        });
        
        // 아이템 제거
        this.destroy();
    }
    
    healthEffect(player) {
        const healAmount = this.itemConfigs.health.value;
        player.health = Math.min(player.health + healAmount, player.maxHealth);
    }
    
    laserEffect(player) {
        // 기존 레이저 효과가 있다면 제거
        if (player.laserTimer) {
            player.laserTimer.remove();
        }
        
        // 레이저 모드 활성화
        player.weaponType = 'laser';
        
        // 시각 효과
        player.setTint(0x00ffff);
        
        // 지속시간 후 효과 제거
        player.laserTimer = this.scene.time.delayedCall(
            this.itemConfigs.laser.duration,
            () => {
                player.weaponType = 'normal';
                player.clearTint();
            }
        );
    }
    
    doubleEffect(player) {
        // 기존 2연발 효과가 있다면 제거
        if (player.doubleTimer) {
            player.doubleTimer.remove();
        }
        
        // 2연발 모드 활성화
        player.weaponType = 'double';
        
        // 시각 효과
        player.setTint(0xffff00);
        
        // 지속시간 후 효과 제거
        player.doubleTimer = this.scene.time.delayedCall(
            this.itemConfigs.double.duration,
            () => {
                player.weaponType = 'normal';
                player.clearTint();
            }
        );
    }
} 