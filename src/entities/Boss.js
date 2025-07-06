import Phaser from 'phaser';

export class Boss extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, stage) {
        super(scene, x, y, 'boss');
        
        this.scene = scene;
        this.stage = stage;
        
        // 스테이지별 보스 색상 설정
        const bossColors = {
            1: 0xff0000,    // 빨강
            2: 0x00ff00,    // 초록
            3: 0x0000ff,    // 파랑
            4: 0xff00ff,    // 보라
            5: 0xffff00     // 노랑
        };
        
        // 보스 기본 설정 (난이도 조정)
        this.health = 80 * stage; // 체력 감소
        this.maxHealth = this.health;
        this.scale = 1.4 + (stage * 0.08); // 크기 증가 감소
        this.baseSpeed = 120 + (stage * 20); // 기본 속도 감소
        
        // 씬에 보스 추가
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // 물리 속성 설정
        this.setCollideWorldBounds(true);
        this.setBounce(0.2);
        
        // 보스 색상 설정
        this.bossColor = bossColors[stage] || 0xff0000;
        
        // 이펙트 파티클 시스템 생성
        this.createParticleSystems();
        
        // 임시 보스 그래픽 생성
        this.createBossGraphics();
        
        // 체력바 생성
        this.createHealthBar();
        
        // 패턴 관련 설정
        this.currentPattern = null;
        this.patternTimer = null;
        this.patternDuration = Math.max(4500 - (stage * 400), 2500); // 패턴 지속시간 조정
        
        // 공격 관련 설정
        this.bullets = scene.physics.add.group();
        this.lastShot = 0;
        this.shotDelay = Math.max(1200 - (stage * 100), 600); // 발사 간격 조정
        
        // 패턴 목록 설정
        this.patterns = [
            this.zigzagPattern.bind(this),
            this.circlePattern.bind(this),
            this.rushPattern.bind(this),
            this.spiralPattern.bind(this),
            this.teleportPattern.bind(this),
            this.crossFirePattern.bind(this)
        ];
        
        // 초기 패턴 시작
        this.startNewPattern();
        
        // 무적 시간
        this.isInvulnerable = false;
        this.invulnerableDuration = 200; // 0.2초
    }
    
    createParticleSystems() {
        // 패턴 변경 이펙트
        this.patternChangeEmitter = this.scene.add.particles(0, 0, 'particle', {
            lifespan: 500,
            speed: { min: 100, max: 200 },
            scale: { start: 0.5, end: 0 },
            blendMode: 'ADD',
            tint: this.bossColor,
            emitting: false
        });

        // 지속적인 트레일 이펙트
        this.trailEmitter = this.scene.add.particles(0, 0, 'particle', {
            lifespan: 300,
            speed: { min: 10, max: 30 },
            scale: { start: 0.3, end: 0 },
            blendMode: 'ADD',
            tint: this.bossColor,
            emitting: false
        });

        // 텔레포트 이펙트
        this.teleportEmitter = this.scene.add.particles(0, 0, 'particle', {
            lifespan: 800,
            speed: { min: 150, max: 250 },
            scale: { start: 0.6, end: 0 },
            blendMode: 'ADD',
            tint: this.bossColor,
            emitting: false
        });
    }
    
    startNewPattern() {
        if (!this.scene || !this.active) return;
        
        // 이전 패턴 타이머 정리
        if (this.patternTimer) {
            this.patternTimer.destroy();
        }
        
        // 새로운 패턴 선택 (이전과 다른 패턴)
        let newPattern;
        do {
            newPattern = Phaser.Math.RND.pick(this.patterns);
        } while (newPattern === this.currentPattern);
        
        // 패턴 변경 시각 효과
        this.showPatternChangeEffect();
        
        this.currentPattern = newPattern;
        
        // 패턴 전환 타이머 설정
        this.patternTimer = this.scene.time.addEvent({
            delay: this.patternDuration,
            callback: () => {
                if (this.active && this.scene) {
                    this.startNewPattern();
                }
            },
            callbackScope: this
        });
    }
    
    showPatternChangeEffect() {
        // 보스 깜빡임 효과
        this.scene.tweens.add({
            targets: this,
            alpha: 0.3,
            duration: 100,
            yoyo: true,
            repeat: 2
        });

        // 패턴 변경 파티클 효과
        this.patternChangeEmitter.setPosition(this.x, this.y);
        this.patternChangeEmitter.explode(20);

        // 원형 파동 효과
        const circle = this.scene.add.circle(this.x, this.y, 10, this.bossColor, 0.5);
        this.scene.tweens.add({
            targets: circle,
            scale: 5,
            alpha: 0,
            duration: 500,
            onComplete: () => circle.destroy()
        });
    }
    
    update(time) {
        if (!this.active || !this.scene) return;
        
        if (this.currentPattern) {
            this.currentPattern(time);
        }
        
        // 총알 발사
        if (time > this.lastShot) {
            this.shoot();
            this.lastShot = time + this.shotDelay;
        }
        
        // 체력바 업데이트
        this.updateHealthBar();

        // 트레일 이펙트 업데이트
        if (this.trailEmitter) {
            this.trailEmitter.setPosition(this.x, this.y);
            this.trailEmitter.emitParticle(2);
        }
    }
    
    zigzagPattern(time) {
        if (!this.active || !this.scene) return;
        
        const amplitude = 200;
        const frequency = 0.002;
        this.setVelocityX(Math.sin(time * frequency) * this.baseSpeed);
        this.setVelocityY(Math.cos(time * frequency * 2) * this.baseSpeed * 0.5);

        // 지그재그 패턴 특수 효과
        if (Math.abs(Math.sin(time * frequency)) > 0.9) {
            this.patternChangeEmitter.setPosition(this.x, this.y);
            this.patternChangeEmitter.emitParticle(5);
        }
    }
    
    circlePattern(time) {
        if (!this.active || !this.scene) return;
        
        const centerX = this.scene.game.config.width / 2;
        const centerY = this.scene.game.config.height / 3;
        const radius = 150;
        const speed = 0.003;
        
        const targetX = centerX + Math.cos(time * speed) * radius;
        const targetY = centerY + Math.sin(time * speed) * radius;
        
        this.scene.physics.moveTo(this, targetX, targetY, this.baseSpeed);

        // 원형 패턴 특수 효과
        const angle = time * speed;
        const trailX = this.x + Math.cos(angle + Math.PI) * 30;
        const trailY = this.y + Math.sin(angle + Math.PI) * 30;
        this.trailEmitter.setPosition(trailX, trailY);
        this.trailEmitter.emitParticle(3);
    }
    
    rushPattern(time) {
        if (!this.active || !this.scene) return;
        
        const player = this.scene.player;
        if (!this.isRushing && player && player.active) {
            this.isRushing = true;
            this.scene.physics.moveTo(this, player.x, player.y, this.baseSpeed * 1.5);
            
            // 러쉬 시작 효과
            this.scene.tweens.add({
                targets: this,
                scale: this.scale * 1.2,
                duration: 100,
                yoyo: true
            });

            // 러쉬용 트레일 이미터 생성
            if (this.rushTrailEmitter) {
                this.rushTrailEmitter.destroy();
            }
            this.rushTrailEmitter = this.scene.add.particles(0, 0, 'particle', {
                lifespan: 300,
                speed: { min: 50, max: 100 },
                scale: { start: 0.3, end: 0 },
                blendMode: 'ADD',
                tint: this.bossColor,
                emitting: false
            });
            
            // 러쉬 종료 타이머
            this.scene.time.delayedCall(1000, () => {
                if (this.active && this.scene) {
                    this.isRushing = false;
                    this.setVelocity(0);
                    
                    // 러쉬 트레일 이미터 제거
                    if (this.rushTrailEmitter) {
                        this.rushTrailEmitter.destroy();
                        this.rushTrailEmitter = null;
                    }
                }
            });
        }

        // 러쉬 중 파티클 효과
        if (this.isRushing && this.rushTrailEmitter) {
            this.rushTrailEmitter.setPosition(this.x, this.y);
            this.rushTrailEmitter.emitParticle(5);
        }
    }
    
    spiralPattern(time) {
        if (!this.active || !this.scene) return;
        
        const centerX = this.scene.game.config.width / 2;
        const centerY = this.scene.game.config.height / 3;
        const speed = 0.004;
        const expandingRadius = 100 + Math.sin(time * 0.001) * 50;
        
        const targetX = centerX + Math.cos(time * speed) * expandingRadius;
        const targetY = centerY + Math.sin(time * speed) * expandingRadius;
        
        this.scene.physics.moveTo(this, targetX, targetY, this.baseSpeed * 1.2);
    }
    
    teleportPattern(time) {
        if (!this.active || !this.scene) return;
        
        if (!this.lastTeleport || time > this.lastTeleport) {
            const margin = 100;
            const randomX = Phaser.Math.Between(margin, this.scene.game.config.width - margin);
            const randomY = Phaser.Math.Between(margin, this.scene.game.config.height / 2);
            
            // 텔레포트 시작 위치에 이펙트
            this.teleportEmitter.setPosition(this.x, this.y);
            this.teleportEmitter.explode(30);
            
            this.scene.tweens.add({
                targets: this,
                alpha: 0,
                duration: 100,
                onComplete: () => {
                    this.setPosition(randomX, randomY);
                    
                    // 텔레포트 도착 위치에 이펙트
                    this.teleportEmitter.setPosition(randomX, randomY);
                    this.teleportEmitter.explode(30);
                    
                    this.scene.tweens.add({
                        targets: this,
                        alpha: 1,
                        duration: 100,
                        onComplete: () => {
                            this.omnidirectionalShot();
                            
                            // 전방위 공격 시 원형 파동 효과
                            const circle = this.scene.add.circle(this.x, this.y, 10, this.bossColor, 0.5);
                            this.scene.tweens.add({
                                targets: circle,
                                scale: 8,
                                alpha: 0,
                                duration: 800,
                                onComplete: () => circle.destroy()
                            });
                        }
                    });
                }
            });
            
            this.lastTeleport = time + 2000;
        }
    }
    
    crossFirePattern(time) {
        if (time < this.lastCrossFire) return;
        
        const scene = this.scene; // Store scene reference
        
        scene.tweens.add({
            targets: this,
            scale: this.scale * 1.3,
            duration: 200,
            yoyo: true,
            onComplete: () => {
                const angles = [0, Math.PI/2, Math.PI, Math.PI*3/2];
                const bulletSpeed = 300;
                
                angles.forEach(angle => {
                    // 총알 발사 라인 효과
                    const line = scene.add.line(
                        this.x, this.y,
                        0, 0,
                        Math.cos(angle) * 50,
                        Math.sin(angle) * 50,
                        this.bossColor, 0.5
                    );
                    scene.tweens.add({
                        targets: line,
                        alpha: 0,
                        duration: 300,
                        onComplete: () => line.destroy()
                    });

                    const bullet = this.bullets.create(this.x, this.y, 'bullet');
                    bullet.setScale(0.5);
                    
                    const velocityX = Math.cos(angle) * bulletSpeed;
                    const velocityY = Math.sin(angle) * bulletSpeed;
                    
                    bullet.setVelocity(velocityX, velocityY);
                    bullet.setRotation(angle);
                    bullet.setTint(this.bossColor);
                    
                    scene.time.delayedCall(3000, () => {
                        bullet.destroy();
                    });
                });
            }
        });
        
        this.lastCrossFire = time + 1500;
    }
    
    omnidirectionalShot() {
        const bulletCount = 8; // 8방향으로 발사
        const angleStep = (Math.PI * 2) / bulletCount;
        const bulletSpeed = 300;
        
        for (let i = 0; i < bulletCount; i++) {
            const angle = i * angleStep;
            const bullet = this.bullets.create(this.x, this.y, 'bullet');
            bullet.setScale(0.5);
            
            // 총알 속도 설정
            const velocityX = Math.cos(angle) * bulletSpeed;
            const velocityY = Math.sin(angle) * bulletSpeed;
            
            bullet.setVelocity(velocityX, velocityY);
            
            // 총알 회전
            bullet.setRotation(angle);
            
            // 총알 색상 설정
            bullet.setTint(this.bossColor);
            
            // 3초 후 총알 제거
            this.scene.time.delayedCall(3000, () => {
                bullet.destroy();
            });
        }
    }
    
    shoot() {
        const player = this.scene.player;
        if (!player) return;
        
        // 다중 발사 (스테이지에 따라 증가, 최대 개수 감소)
        const bulletCount = Math.min(1 + Math.floor(this.stage / 2), 3); // 최대 3발로 제한
        const spreadAngle = 25; // 총알 퍼짐 각도 감소
        
        for (let i = 0; i < bulletCount; i++) {
            const bullet = this.bullets.create(this.x, this.y, 'bullet');
            bullet.setScale(0.5);
            
            // 기본 각도 계산 (보스에서 플레이어 방향)
            const baseAngle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
            
            // 총알별 각도 조정
            let angle = baseAngle;
            if (bulletCount > 1) {
                const offset = (i - (bulletCount - 1) / 2) * (spreadAngle / (bulletCount - 1));
                angle += Phaser.Math.DegToRad(offset);
            }
            
            // 총알 속도 설정 (속도 감소)
            const speed = 250 + (this.stage * 15);
            const velocityX = Math.cos(angle) * speed;
            const velocityY = Math.sin(angle) * speed;
            
            bullet.setVelocity(velocityX, velocityY);
            
            // 3초 후 총알 제거
            this.scene.time.delayedCall(3000, () => {
                bullet.destroy();
            });
        }
    }
    
    takeDamage(damage) {
        if (this.isInvulnerable) return;
        
        this.health -= damage;
        this.isInvulnerable = true;
        
        // 피격 효과
        this.scene.tweens.add({
            targets: this,
            alpha: 0.5,
            duration: 50,
            yoyo: true,
            repeat: 1,
            onComplete: () => {
                this.alpha = 1;
                this.isInvulnerable = false;
            }
        });
        
        // 체력바 업데이트
        this.updateHealthBar();
        
        // 체력이 0 이하면 처치
        if (this.health <= 0) {
            this.die();
        }
    }
    
    die() {
        if (!this.scene) return;
        
        // 스테이지 클리어 이벤트 발생 (가장 먼저)
        this.scene.events.emit('bossDied');
        
        // 패턴 타이머 정리
        if (this.patternTimer) {
            this.patternTimer.destroy();
        }
        
        // 모든 총알 제거
        if (this.bullets) {
            this.bullets.clear(true, true);
        }
        
        // 체력바 제거
        if (this.healthBar) {
            this.healthBar.destroy();
        }
        
        // 폭발 효과
        const particles = this.scene.add.particles(this.x, this.y, 'particle', {
            speed: { min: -200, max: 200 },
            angle: { min: 0, max: 360 },
            scale: { start: 1.5, end: 0 },
            lifespan: 1000,
            gravityY: 200,
            quantity: 1,
            frequency: 20,
            tint: [this.bossColor],
            emitting: false
        });
        
        particles.explode(50);
        
        // 마지막으로 보스 제거
        this.destroy();
    }
    
    createBossGraphics() {
        const graphics = this.scene.add.graphics();
        graphics.clear();
        
        // 보스 외곽선 (흰색)
        graphics.lineStyle(2, 0xffffff);
        
        // 보스 채우기 (스테이지별 색상)
        graphics.fillStyle(this.bossColor, 1);
        
        // 보스 몸체 (원형)
        graphics.fillCircle(50, 50, 30);
        graphics.strokeCircle(50, 50, 30);
        
        // 보스 날개 (삼각형)
        graphics.fillTriangle(10, 70, 50, 30, 90, 70);
        graphics.strokeTriangle(10, 70, 50, 30, 90, 70);
        
        // 텍스처 생성
        graphics.generateTexture('boss' + this.stage, 100, 100);
        graphics.destroy();
        
        // 스프라이트 텍스처 설정
        this.setTexture('boss' + this.stage);
    }
    
    createHealthBar() {
        this.healthBar = this.scene.add.graphics();
        this.updateHealthBar();
    }
    
    updateHealthBar() {
        if (!this.healthBar) return;
        
        this.healthBar.clear();
        
        // 체력바 배경 (검정)
        this.healthBar.fillStyle(0x000000);
        this.healthBar.fillRect(this.x - 40, this.y - 50, 80, 8);
        
        // 현재 체력 (보스 색상)
        const healthWidth = Math.max((this.health / this.maxHealth) * 80, 0);
        this.healthBar.fillStyle(this.bossColor);
        this.healthBar.fillRect(this.x - 40, this.y - 50, healthWidth, 8);
    }
} 