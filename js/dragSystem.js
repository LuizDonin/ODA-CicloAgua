export default class dragSystem extends Phaser.Scene {
    constructor(){ super('dragSystem'); }
  
    init(payload) {
        this.dataJSON = payload?.data || this.registry.get('gameData');
        this.correct = 0;
    }
  
    create() {
        const data    = this.dataJSON;
        const dragCfg = data.drag || {};
        const items   = data.items || [];
        const targets = data.targets || [];

        const W = this.scale.width;
        const H = this.scale.height;

        const useNorm = String(dragCfg.units || '').toLowerCase() === 'normalized';
        const sx = useNorm ? W : 1;
        const sy = useNorm ? H : 1;

        // Score
        this.total = items.length;
        this.hud = this.add.text(16, 16, `Acertos: 0/${this.total}`, {
            fontFamily:'Nunito', fontSize:'22px', color:'#fff'
        }).setScrollFactor(0);

        // Targets
        this.targetsById = new Map();

        targets.forEach(t => {
            const x = Math.round(t.x * sx);
            const y = Math.round(t.y * sy);

            const img = this.add.image(x, y, t.sprite)
            .setOrigin(0.5)
            .setAlpha(0.9);

            const zoneW = img.displayWidth;
            const zoneH = img.displayHeight;

            const zone = this.add.zone(img.x, img.y, zoneW, zoneH)
            .setRectangleDropZone(zoneW, zoneH);

            zone.setData('id', t.id);
            this.targetsById.set(t.id, { zone, img });
        });

        // Draggables
        const boxKey = dragCfg.textboxSpriteKey;

        items.forEach(it => {
            const startX = Math.round(it.start.x * sx);
            const startY = Math.round(it.start.y * sy);

            const bg = this.add.image(0, 0, boxKey).setOrigin(0.5);
            const wrapWidth = Math.max(50, (bg.displayWidth || bg.width || 360) - 80);

            const label = this.add.text(0, 0, it.text, {
            fontFamily:'Nunito', fontSize:'22px', color:'#000',
            wordWrap:{ width: wrapWidth, useAdvancedWrap:true },
            align:'center'
            }).setOrigin(0.5);

            const draggable = this.add.container(startX, startY, [bg, label]);
            const w = bg.displayWidth || bg.width || 360;
            const h = bg.displayHeight || bg.height || 90;
            draggable.setSize(w, h);

            draggable.setData('home', { x:startX, y:startY });
            draggable.setData('targetId', it.targetId);

            draggable.setInteractive({ cursor:'grab' });
            this.input.setDraggable(draggable);
        });

        //Drag Events
        this.input.on('dragstart', (pointer, obj) => {
            obj.setDepth(999);
            obj.setAlpha(0.9);
        });

        this.input.on('drag', (pointer, obj, dx, dy) => {
            obj.x = dx; obj.y = dy;
        });

        this.input.on('dragenter', (pointer, obj, zone) => {
            const id = zone?.getData('id');
            const t  = id ? this.targetsById.get(id) : null;
            t?.img?.setAlpha(1);
        });

        this.input.on('dragleave', (pointer, obj, zone) => {
            const id = zone?.getData('id');
            const t  = id ? this.targetsById.get(id) : null;
            t?.img?.setAlpha(0.9);
        });

        this.input.on('drop', (pointer, obj, zone) => {
            const hitId  = zone?.getData('id');
            const mustId = obj.getData('targetId');
        
            const t = hitId ? this.targetsById.get(hitId) : null;       
        
            if (hitId && hitId === mustId) {
            obj.disableInteractive();
            t?.img?.setAlpha(1);
        
            const zoneH = zone.height || 0;
            const itemH = obj.height || 0;
            const padding = 32;
            let targetY;
        
            if (zoneH && itemH) {
                const topY = zone.y - zoneH / 2;
                targetY = topY + itemH / 2 + padding;
            } else {
                const SNAP_OFFSET_Y = -24;
                targetY = zone.y + SNAP_OFFSET_Y;
            }
        
            this.tweens.add({
                targets: obj,
                x: zone.x,
                y: targetY,
                duration: 140,
                ease: 'Quad.easeOut'
            });
        
            this.correct += 1;
            this.hud.setText(`Acertos: ${this.correct}/${this.total}`);
        
            if (this.correct >= this.total) {
                this.time.delayedCall(250, () => {
                this.game.events.emit('drag:complete', { score: this.correct });
                });
            }
            } else {
            const home = obj.getData('home');
            this.tweens.add({ targets: obj, x: home.x, y: home.y, duration: 220, ease: 'Quad.easeOut' });
            t?.img?.setAlpha(0.9);
            }
        });

        this.input.on('dragend', (pointer, obj, dropped) => {
            obj.setAlpha(1).setDepth(1);
            if (!dropped) {
            const home = obj.getData('home');
            this.tweens.add({ targets: obj, x: home.x, y: home.y, duration: 200, ease: 'Quad.easeOut' });
            }
        });
    }
  }
  