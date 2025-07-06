import Phaser from 'phaser';

export class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'player');
        
        this.scene = scene;
        this.health = 150;
        this.maxHealth = this.health;
        
        // 씬에 플레이어 추가
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // 이동 속성 설정
        this.moveSpeed = 300;
        this.diagonalSpeed = this.moveSpeed * 0.707; // 대각선 이동 시 속도 (1/√2)
        
        // 물리 속성 설정
        this.setCollideWorldBounds(true);
        this.setBounce(0);
        this.setDrag(0.2);
        
        // 총알 그룹 생성
        this.bullets = scene.physics.add.group();
        
        // 키보드 입력 설정
        this.cursors = scene.input.keyboard.createCursorKeys();
        this.fireKey = scene.input.keyboard.addKey('SPACE'); // 스페이스바로 발사
        
        // 체력바 생성
        this.createHealthBar();
        
        // 무적 시간
        this.isInvulnerable = false;
        this.invulnerableDuration = 1000; // 1초
        
        // 발사 쿨다운
        this.lastFired = 0;
        this.fireRate = 200; // 발사 간격 (ms)
        
        // 총알 파티클 이펙트
        this.createBulletParticles();
        
        // 무기 상태 UI 생성
        this.createWeaponUI();
        
        // 무기 타입 초기화
        this.weaponType = 'normal';  // 기본 무기 타입
    }
    
    createBulletParticles() {
        this.bulletParticles = this.scene.add.particles(0, 0, 'particle', {
            speed: 100,
            scale: { start: 0.2, end: 0 },
            blendMode: 'ADD',
            lifespan: 200,
            quantity: 1,
            frequency: 20,
            tint: [0x00ffff],
            emitting: false
        });
    }
    
    createWeaponUI() {
        // UI 컨테이너 생성 (배경)
        const padding = 10;
        const width = 160;
        const height = 70;
        
        // 무기 UI를 오른쪽 상단에 배치
        const graphics = this.scene.add.graphics();
        graphics.fillStyle(0x000000, 0.7);
        graphics.fillRoundedRect(
            this.scene.game.config.width - width - padding,
            padding,
            width,
            height,
            8
        );
        graphics.setScrollFactor(0);
        graphics.setDepth(999);
        
        // 무기 상태 텍스트 스타일
        const style = {
            fontSize: '16px',
            fill: '#ffffff',
            padding: { x: 5, y: 2 }
        };
        
        // 무기 상태 텍스트 생성 (오른쪽 상단)
        this.weaponText = this.scene.add.text(
            this.scene.game.config.width - width - padding + 10,
            padding + 10,
            'Weapon: Normal',
            style
        );
        this.weaponText.setScrollFactor(0);
        this.weaponText.setDepth(1000);
        
        // 무기 타이머 텍스트 생성
        this.weaponTimerText = this.scene.add.text(
            this.scene.game.config.width - width - padding + 10,
            padding + 35,
            '',
            style
        );
        this.weaponTimerText.setScrollFactor(0);
        this.weaponTimerText.setDepth(1000);
    }
    
    updateWeaponUI() {
        // 무기 타입에 따른 텍스트 설정
        let weaponName = 'Normal';
        let color = '#ffffff';
        
        switch(this.weaponType) {
            case 'laser':
                weaponName = 'Laser Beam';
                color = '#00ffff';
                break;
            case 'double':
                weaponName = 'Double Shot';
                color = '#ffff00';
                break;
        }
        
        this.weaponText.setText(`Weapon: ${weaponName}`);
        this.weaponText.setColor(color);
        
        // 타이머 업데이트
        if (this.weaponType !== 'normal') {
            let timer = null;
            if (this.weaponType === 'laser' && this.laserTimer) {
                timer = this.laserTimer;
            } else if (this.weaponType === 'double' && this.doubleTimer) {
                timer = this.doubleTimer;
            }
            
            if (timer) {
                const timeLeft = Math.ceil(timer.getRemaining() / 1000);
                this.weaponTimerText.setText(`Duration: ${timeLeft}s`);
                this.weaponTimerText.setColor(color);
            }
        } else {
            this.weaponTimerText.setText('');
        }
    }
    
    update(time) {
        // 이동 처리
        if (this.cursors.left.isDown) {
            this.setVelocityX(-this.moveSpeed);
        } else if (this.cursors.right.isDown) {
            this.setVelocityX(this.moveSpeed);
        } else {
            this.setVelocityX(0);
        }

        if (this.cursors.up.isDown) {
            this.setVelocityY(-this.moveSpeed);
        } else if (this.cursors.down.isDown) {
            this.setVelocityY(this.moveSpeed);
        } else {
            this.setVelocityY(0);
        }
        
        // 대각선 이동 속도 보정
        if ((this.cursors.left.isDown || this.cursors.right.isDown) && 
            (this.cursors.up.isDown || this.cursors.down.isDown)) {
            this.setVelocity(
                this.body.velocity.x * 0.707,
                this.body.velocity.y * 0.707
            );
        }
        
        // 화면 중앙에서 멀어질수록 크기 감소
        const screenHeight = this.scene.game.config.height;
        if (this.y !== screenHeight / 2) {
            const distanceFromCenter = Math.abs(this.y - (screenHeight / 2)) / (screenHeight / 2);
            const scaleModifier = 1 - (distanceFromCenter * 0.2); // 최대 20% 크기 변화
            this.setScale(0.8 * scaleModifier);
            
            // 투명도는 위쪽으로 갈수록 더 투명하게
            const alpha = 1 - (distanceFromCenter * 0.3);
            this.setAlpha(alpha);
        } else {
            this.setScale(0.8);
            this.setAlpha(1);
        }
        
        // 발사 처리
        if (this.fireKey.isDown && time > this.lastFired) {
            this.shootAtBoss();
            this.lastFired = time + this.fireRate;
        }
        
        // 무기 UI 업데이트
        this.updateWeaponUI();
        
        // 체력바 업데이트
        this.updateHealthBar();
    }
    
    shootAtBoss() {
        // 보스 찾기
        const boss = this.scene.children.list.find(child => child.constructor.name === 'Boss');
        if (!boss) return;
        
        // 무기 타입에 따른 발사
        switch(this.weaponType) {
            case 'laser':
                this.shootLaser(boss);
                break;
            case 'double':
                this.shootDouble(boss);
                break;
            default:
                this.shootNormal(boss);
                break;
        }
    }
    
    shootNormal(boss) {
        // 총알 생성
        const bullet = this.bullets.create(this.x, this.y, 'bullet');
        bullet.setScale(0.5);
        
        // 총알 속도 설정
        const speed = 400;
        const angle = Phaser.Math.Angle.Between(this.x, this.y, boss.x, boss.y);
        
        // 총알 회전
        bullet.setRotation(angle);
        
        // 총알 속도 벡터 계산
        const velocityX = Math.cos(angle) * speed;
        const velocityY = Math.sin(angle) * speed;
        
        // 총알 발사
        bullet.setVelocity(velocityX, velocityY);
        
        // 총알 색상 설정
        bullet.setTint(0x00ffff);
        
        // 총알 데미지 설정
        bullet.damage = 10;
        
        // 파티클 효과
        this.bulletParticles.setPosition(this.x, this.y);
        this.bulletParticles.explode();
        
        // 3초 후 총알 제거
        this.scene.time.delayedCall(3000, () => {
            if (bullet.active) {
                bullet.destroy();
            }
        });
    }
    
    shootLaser(boss) {
        // 레이저 총알 생성
        const bullet = this.bullets.create(this.x, this.y, 'bullet');
        bullet.setScale(1, 0.3);
        
        // 총알 속도 설정
        const speed = 600;
        const angle = Phaser.Math.Angle.Between(this.x, this.y, boss.x, boss.y);
        
        // 총알 회전
        bullet.setRotation(angle);
        
        // 총알 속도 벡터 계산
        const velocityX = Math.cos(angle) * speed;
        const velocityY = Math.sin(angle) * speed;
        
        // 총알 발사
        bullet.setVelocity(velocityX, velocityY);
        
        // 레이저 색상 설정
        bullet.setTint(0x00ffff);
        
        // 총알 데미지 설정
        bullet.damage = 20;
        
        // 레이저 파티클 효과
        this.bulletParticles.setPosition(this.x, this.y);
        this.bulletParticles.explode(5);
        
        // 2초 후 총알 제거
        this.scene.time.delayedCall(2000, () => {
            if (bullet.active) {
                bullet.destroy();
            }
        });
    }
    
    shootDouble(boss) {
        // 좌우로 약간 벌어진 위치에서 발사
        const offsets = [-15, 15];
        
        offsets.forEach(offset => {
            // 총알 생성
            const bullet = this.bullets.create(this.x + offset, this.y, 'bullet');
            bullet.setScale(0.4);
            
            // 총알 속도 설정
            const speed = 400;
            const angle = Phaser.Math.Angle.Between(this.x, this.y, boss.x, boss.y);
            
            // 총알 회전
            bullet.setRotation(angle);
            
            // 총알 속도 벡터 계산
            const velocityX = Math.cos(angle) * speed;
            const velocityY = Math.sin(angle) * speed;
            
            // 총알 발사
            bullet.setVelocity(velocityX, velocityY);
            
            // 총알 색상 설정
            bullet.setTint(0xffff00);
            
            // 총알 데미지 설정
            bullet.damage = 8;
            
            // 파티클 효과
            this.bulletParticles.setPosition(this.x + offset, this.y);
            this.bulletParticles.explode(2);
            
            // 3초 후 총알 제거
            this.scene.time.delayedCall(3000, () => {
                if (bullet.active) {
                    bullet.destroy();
                }
            });
        });
    }
    
    takeDamage(damage) {
        if (this.isInvulnerable) return;
        
        this.health -= damage;
        this.isInvulnerable = true;
        
        // 피격 효과
        this.scene.tweens.add({
            targets: this,
            alpha: 0.5,
            duration: 100,
            yoyo: true,
            repeat: 4,
            onComplete: () => {
                if (this.active) {
                    this.alpha = 1;
                    this.isInvulnerable = false;
                }
            }
        });
        
        // 체력이 0 이하면 게임 오버
        if (this.health <= 0) {
            this.die();
        }
    }
    
    die() {
        if (!this.scene || !this.active) return;
        
        // 폭발 효과
        const explosion = this.scene.add.particles(this.x, this.y, 'particle', {
            speed: { min: -200, max: 200 },
            scale: { start: 0.4, end: 0 },
            blendMode: 'ADD',
            lifespan: 500,
            quantity: 20,
            tint: [0x00ffff]
        });
        
        // 1초 후 폭발 효과 제거
        this.scene.time.delayedCall(1000, () => {
            if (explosion) {
                explosion.destroy();
            }
        });
        
        // 체력바 제거
        if (this.healthBar) {
            this.healthBar.destroy();
        }
        
        // 총알 파티클 제거
        if (this.bulletParticles) {
            this.bulletParticles.destroy();
        }
        
        // 모든 총알 제거
        this.bullets.clear(true, true);
        
        // 게임오버 이벤트 발생
        this.scene.events.emit('gameOver');
        
        // 플레이어 제거
        this.destroy();
    }
    
    createHealthBar() {
        this.healthBar = this.scene.add.graphics();
    }
    
    updateHealthBar() {
        this.healthBar.clear();
        
        // 체력바 배경 (회색)
        this.healthBar.fillStyle(0x333333);
        this.healthBar.fillRect(this.x - 45, this.y - 40, 90, 6);
        
        // 현재 체력 (파란색)
        const healthWidth = Math.max((this.health / this.maxHealth) * 90, 0);
        this.healthBar.fillStyle(0x00ffff);
        this.healthBar.fillRect(this.x - 45, this.y - 40, healthWidth, 6);
    }
} 