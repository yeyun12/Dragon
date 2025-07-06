import Phaser from 'phaser';

export class Bullet extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'bullet');
        
        this.speed = 400;
        this.damage = 10;
        this.lifespan = 1000;
    }
    
    fire() {
        this.setActive(true);
        this.setVisible(true);
        
        // 위로 발사
        this.setVelocityY(-this.speed);
        
        // 일정 시간 후 제거
        this.scene.time.delayedCall(this.lifespan, () => {
            this.destroy();
        });
    }
    
    update() {
        // 화면 밖으로 나가면 제거
        if (this.y < -50) {
            this.destroy();
        }
    }
} 