import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { Boss } from '../entities/Boss';
import { Item } from '../entities/Item';

export class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.stage = 1;
        this.score = 0;
        this.gameTimer = 60; // 1분
    }

    create() {
        // 배경 설정
        this.add.rectangle(0, 0, 800, 600, 0x000000).setOrigin(0);
        
        // UI 생성
        this.createUI();
        
        // 플레이어 생성
        this.player = new Player(this, 400, 500);
        
        // 보스 생성
        this.boss = new Boss(this, 400, 100, this.stage);
        
        // 아이템 그룹 생성
        this.items = this.physics.add.group({
            classType: Item,
            runChildUpdate: true
        });
        
        // 충돌 설정
        this.setupCollisions();
        
        // 게임오버 이벤트 처리
        this.events.on('gameOver', this.handleGameOver, this);
        
        // 타이머 설정
        this.time.addEvent({
            delay: 1000,
            callback: this.updateTimer,
            callbackScope: this,
            loop: true
        });
        
        // 아이템 드롭 타이머
        this.time.addEvent({
            delay: 10000, // 10초마다
            callback: this.spawnRandomItem,
            callbackScope: this,
            loop: true
        });
        
        // 씬이 시작될 때마다 초기 상태 설정
        this.events.once('create', () => {
            this.stage = 1;
            this.score = 0;
            this.gameTimer = 60;
        });
    }
    
    createUI() {
        // 스테이지 정보
        this.stageText = this.add.text(10, 10, '스테이지: ' + this.stage, {
            fontSize: '20px',
            fill: '#ffffff'
        });
        
        // 타이머
        this.timerText = this.add.text(10, 40, '남은 시간: ' + this.gameTimer, {
            fontSize: '20px',
            fill: '#ffffff'
        });
        
        // 점수
        this.scoreText = this.add.text(10, 70, '점수: ' + this.score, {
            fontSize: '20px',
            fill: '#ffffff'
        });
        
        // 보스 체력 (화면 상단 중앙)
        this.bossHealthText = this.add.text(this.game.config.width / 2, 10, '보스 체력: 100%', {
            fontSize: '20px',
            fill: '#ff0000'
        });
        this.bossHealthText.setOrigin(0.5, 0); // 중앙 정렬
    }
    
    updateUI() {
        // 스테이지 텍스트 업데이트
        this.stageText.setText('스테이지: ' + this.stage);
        
        // 타이머 텍스트 업데이트
        this.timerText.setText('남은 시간: ' + this.gameTimer);
        
        // 점수 텍스트 업데이트
        this.scoreText.setText('점수: ' + this.score);
        
        // 보스 체력 텍스트 업데이트
        if (this.boss && this.boss.active) {
            const healthPercent = Math.floor((this.boss.health / this.boss.maxHealth) * 100);
            this.bossHealthText.setText('보스 체력: ' + healthPercent + '%');
        }
    }
    
    updateTimer() {
        this.gameTimer--;
        
        if (this.gameTimer <= 0) {
            // 시간 초과로 게임 오버
            if (this.player && this.player.active) {
                this.player.die();
            }
        }
    }
    
    setupCollisions() {
        // 플레이어 총알과 보스 충돌
        this.physics.add.overlap(
            this.player.bullets,
            this.boss,
            this.handleBulletHitBoss,
            null,
            this
        );
        
        // 보스 총알과 플레이어 충돌
        this.physics.add.overlap(
            this.boss.bullets,
            this.player,
            this.handleBulletHitPlayer,
            null,
            this
        );
        
        // 플레이어와 보스 직접 충돌
        this.physics.add.overlap(
            this.player,
            this.boss,
            this.handlePlayerBossCollision,
            null,
            this
        );
        
        // 플레이어와 아이템 충돌
        this.physics.add.overlap(
            this.player,
            this.items,
            this.handleItemCollect,
            null,
            this
        );
    }
    
    handleBulletHitBoss(boss, bullet) {
        // 총알 제거
        bullet.destroy();
        
        // 보스 데미지 처리
        boss.takeDamage(10 * (this.player.powerMultiplier || 1));
        
        // 점수 추가
        this.score += 10;
        
        // 아이템 드롭 확률 (10%)
        if (Phaser.Math.Between(1, 100) <= 10) {
            this.spawnRandomItem();
        }
        
        // 보스가 죽었는지 확인
        if (boss.health <= 0) {
            this.handleBossDefeated();
        }
    }
    
    handleBulletHitPlayer(player, bullet) {
        // 총알 제거
        bullet.destroy();
        
        // 플레이어 데미지 처리
        player.takeDamage(20);
    }
    
    handlePlayerBossCollision(player, boss) {
        // 플레이어 데미지 처리
        player.takeDamage(30);
    }
    
    handleItemCollect(player, item) {
        if (item && item.collect) {
            item.collect(player);
        }
    }
    
    createItem(x, y, type) {
        // 유효한 아이템 타입 확인
        const validTypes = ['health', 'laser', 'double'];
        const itemType = type || validTypes[Math.floor(Math.random() * validTypes.length)];
        
        // 아이템 생성
        const item = new Item(this, x, y, itemType);
        this.items.add(item);
        return item;
    }
    
    spawnRandomItem() {
        // 랜덤 위치 계산
        const x = Phaser.Math.Between(50, this.game.config.width - 50);
        const y = Phaser.Math.Between(50, this.game.config.height / 2);
        
        // 아이템 생성
        this.createItem(x, y);
    }
    
    handleBossDefeated() {
        // 보너스 점수 추가
        this.score += 100 * this.stage;
        
        // 스테이지 5 클리어 시 게임 클리어
        if (this.stage >= 5) {
            this.handleGameClear();
            return;
        }
        
        // 스테이지 증가
        this.stage++;
        
        // 추가 시간 부여
        this.gameTimer += 30;
        
        // 현재 보스 제거
        this.boss.destroy();
        
        // 새로운 보스 생성
        this.boss = new Boss(this, 400, 100, this.stage);
        
        // 새로운 보스에 대한 충돌 설정
        this.setupCollisions();
        
        // 보상 아이템 드롭
        this.spawnRandomItem();
        
        // 스테이지 클리어 메시지 표시
        const stageText = this.add.text(400, 300, `STAGE ${this.stage-1} CLEAR!`, {
            fontSize: '48px',
            fill: '#00ff00',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        // 2초 후 메시지 제거
        this.time.delayedCall(2000, () => {
            stageText.destroy();
        });
    }
    
    handleGameClear() {
        // 모든 게임 오브젝트 정리
        if (this.player && this.player.bullets) {
            this.player.bullets.clear(true, true);
        }
        if (this.boss && this.boss.bullets) {
            this.boss.bullets.clear(true, true);
        }
        this.items.clear(true, true);
        
        // 게임 클리어 효과음 (나중에 추가)
        
        // 승리 파티클 효과
        const particles = this.add.particles(0, 0, 'particle', {
            x: { min: 0, max: this.game.config.width },
            y: -10,
            quantity: 2,
            lifespan: 3000,
            speedY: { min: 100, max: 200 },
            scale: { start: 0.6, end: 0 },
            tint: [0xffff00, 0x00ff00, 0x00ffff],
            emitting: true
        });
        
        // 게임 클리어 텍스트
        const clearText = this.add.text(400, 200, 'CONGRATULATIONS!', {
            fontSize: '64px',
            fill: '#ffff00',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        // 완료 메시지
        const completeText = this.add.text(400, 300, 'You have completed all stages!', {
            fontSize: '32px',
            fill: '#ffffff'
        }).setOrigin(0.5);
        
        // 최종 점수 표시
        const finalScoreText = this.add.text(400, 380, `Final Score: ${this.score}`, {
            fontSize: '40px',
            fill: '#00ff00'
        }).setOrigin(0.5);
        
        // 재시작 버튼 생성
        const restartButton = this.add.rectangle(400, 480, 200, 50, 0x00ff00, 0.8);
        restartButton.setInteractive();
        
        const restartText = this.add.text(400, 480, '처음부터', {
            fontSize: '28px',
            fill: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        // 버튼 호버 효과
        restartButton.on('pointerover', () => {
            restartButton.setFillStyle(0x00cc00);
            this.input.setDefaultCursor('pointer');
        });
        
        restartButton.on('pointerout', () => {
            restartButton.setFillStyle(0x00ff00, 0.8);
            this.input.setDefaultCursor('default');
        });
        
        // 버튼 클릭 효과 및 재시작 로직
        restartButton.on('pointerdown', () => {
            restartButton.setFillStyle(0x009900);
        });
        
        restartButton.on('pointerup', () => {
            // 파티클 제거
            particles.destroy();
            
            // 이벤트 리스너 제거
            this.events.off('gameOver');
            
            // 타이머 이벤트 제거
            this.time.removeAllEvents();
            
            // 게임 상태 초기화
            this.stage = 1;
            this.score = 0;
            this.gameTimer = 60;
            
            // 커서 초기화
            this.input.setDefaultCursor('default');
            
            // 씬 재시작
            this.scene.restart();
        });
        
        // ESC 키로도 재시작 가능하도록 설정
        this.input.keyboard.once('keydown-ESC', () => {
            restartButton.emit('pointerup');
        });
    }
    
    handleGameOver() {
        // 게임 오버 텍스트 표시
        const gameOverText = this.add.text(400, 250, 'GAME OVER', {
            fontSize: '64px',
            fill: '#ff0000',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        // 최종 점수 표시
        const finalScoreText = this.add.text(400, 350, '최종 점수: ' + this.score, {
            fontSize: '32px',
            fill: '#ffffff'
        }).setOrigin(0.5);
        
        // 재시작 버튼 생성
        const restartButton = this.add.rectangle(400, 420, 200, 50, 0x00ff00, 0.8);
        restartButton.setInteractive();
        
        const restartText = this.add.text(400, 420, '재시작', {
            fontSize: '28px',
            fill: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        // 버튼 호버 효과
        restartButton.on('pointerover', () => {
            restartButton.setFillStyle(0x00cc00);
            this.input.setDefaultCursor('pointer');
        });
        
        restartButton.on('pointerout', () => {
            restartButton.setFillStyle(0x00ff00, 0.8);
            this.input.setDefaultCursor('default');
        });
        
        // 버튼 클릭 효과 및 재시작 로직
        restartButton.on('pointerdown', () => {
            restartButton.setFillStyle(0x009900);
        });
        
        restartButton.on('pointerup', () => {
            // 모든 게임 오브젝트 정리
            if (this.player && this.player.bullets) {
                this.player.bullets.clear(true, true);
            }
            if (this.boss && this.boss.bullets) {
                this.boss.bullets.clear(true, true);
            }
            
            // 모든 아이템 제거
            this.items.clear(true, true);
            
            // 이벤트 리스너 제거
            this.events.off('gameOver');
            
            // 타이머 이벤트 제거
            this.time.removeAllEvents();
            
            // 게임 상태 초기화
            this.stage = 1;
            this.score = 0;
            this.gameTimer = 60;
            
            // 커서 초기화
            this.input.setDefaultCursor('default');
            
            // 씬 재시작
            this.scene.restart();
        });
        
        // ESC 키로도 재시작 가능하도록 설정
        this.input.keyboard.once('keydown-ESC', () => {
            restartButton.emit('pointerup');
        });
    }
    
    update(time) {
        if (this.player && this.player.active) {
            this.player.update(time);
        }
        
        if (this.boss && this.boss.active) {
            this.boss.update(time);
        }
        
        // 아이템 업데이트
        this.items.children.each(item => {
            if (item.active) {
                item.update();
            }
        });
        
        // UI 업데이트
        this.updateUI();
    }

    preload() {
        // 아이템 텍스처 미리 생성
        this.createItemTextures();
    }
    
    createItemTextures() {
        const itemTypes = ['health', 'laser', 'double'];
        const itemConfigs = {
            health: {
                color: 0xff0000,
                symbol: '♥',
                scale: 1
            },
            laser: {
                color: 0x00ffff,
                symbol: '▲',
                scale: 1.2
            },
            double: {
                color: 0xffff00,
                symbol: '◆',
                scale: 1.1
            }
        };
        
        itemTypes.forEach(type => {
            // Skip if texture already exists
            if (this.textures.exists('item_' + type)) {
                return;
            }

            const config = itemConfigs[type];
            const size = 30;
            
            // 그래픽스 생성
            const graphics = this.add.graphics();
            
            // 외부 원
            graphics.lineStyle(3, 0xffffff);
            graphics.strokeCircle(size/2, size/2, size/2);
            
            // 내부 원
            graphics.lineStyle(2, config.color);
            graphics.fillStyle(config.color, 0.5);
            graphics.fillCircle(size/2, size/2, size/2 - 3);
            
            // 아이템 심볼
            const text = this.add.text(size/2, size/2, config.symbol, {
                fontSize: '20px',
                fontFamily: 'Arial',
                fontStyle: 'bold',
                color: '#ffffff'
            }).setOrigin(0.5);
            
            // 텍스처 생성
            const renderTexture = this.add.renderTexture(0, 0, size, size);
            renderTexture.draw([graphics, text]);
            renderTexture.saveTexture('item_' + type);
            
            // cleanup
            graphics.destroy();
            text.destroy();
            renderTexture.destroy();
        });
    }
} 