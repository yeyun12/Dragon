import { expect } from 'chai';
import { JSDOM } from 'jsdom';

describe('Game Setup', () => {
    let game;
    let dom;

    before(() => {
        dom = new JSDOM('<!DOCTYPE html><html><body><div id="game"></div></body></html>');
        global.window = dom.window;
        global.document = dom.window.document;
    });

    it('should initialize Phaser game instance', () => {
        expect(game).to.exist;
        expect(game.config.type).to.equal(Phaser.AUTO);
        expect(game.config.width).to.equal(800);
        expect(game.config.height).to.equal(600);
    });

    it('should have correct game settings', () => {
        expect(game.config.physics.default).to.equal('arcade');
        expect(game.config.physics.arcade.gravity.y).to.equal(0);
    });

    it('should load required assets', () => {
        const scene = game.scene.getScene('BootScene');
        expect(scene.load.queue.length).to.be.above(0);
    });
}); 