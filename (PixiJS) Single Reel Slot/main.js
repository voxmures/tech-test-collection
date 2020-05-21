const Config = {
	'reels': {
		'reel0': {
			'symbols': [
				'SYM1', 'SYM2', 'SYM3', 'SYM3', 'SYM4',
				'SYM4', 'SYM1', 'SYM1', 'SYM1', 'SYM4', 
				'SYM4', 'SYM4', 'SYM4', 'SYM2', 'SYM1',
				'SYM1', 'SYM3', 'SYM1', 'SYM1', 'SYM5',
				'SYM5', 'SYM5', 'SYM2', 'SYM2', 'SYM1',
				'SYM3', 'SYM5', 'SYM1', 'SYM1', 'SYM1',
				'SYM5', 'SYM5', 'SYM4', 'SYM3', 'SYM2',
				'SYM1', 'SYM1'
			],
			'initialStop': 0,
			'width': 140,
			'height': 384
		}
	},
	'basebet': 1
}

class SymbolId {
	static SYM1 = 'sym1';
	static SYM2 = 'sym2';
	static SYM3 = 'sym3';
	static SYM4 = 'sym4';
	static SYM5 = 'sym5';
}

class Symbol extends PIXI.Sprite {

	static width = 128;
	static height = 128;

	id = '';

	constructor() {
		super();
	}

	default() {
		game.setTexture(this, this.id);
	}
}

class ReelEvent {
	static ON_START_SPINNING = 'REEL.ON_START_SPINNING';
	static ON_QUICKSTOP = 'REEL.ON_QUICKSTOP';
	static ON_STOP = 'REEL.ON_STOP';
}

const ReelAnimationStates = {
	'IDLE': 0,
	'SPINNING': 1,
	'STOPPING': 2
}

class Reel extends PIXI.Container {

	static SPIN_DURATION = 3000;
	static MAX_SPEED = Symbol.height / 100;	// A symbol per 0.1 seconds

	_name = '';
	_width = 0;
	_height = 0;

	_reel = [];
	_spinStop = -1;
	_symbols = [];	// Pool of symbols

	_animationState = ReelAnimationStates.IDLE;
	_animationTick = 0;

	_currentIndex = -1;
	_startPosition = -1;

	get isSpinning() {
		return this._animationState === ReelAnimationStates.SPINNING || 
			this._animationState === ReelAnimationStates.STOPPING;
	}

	get visibleSymbols() {
		return this._symbols.slice(1, 4).map(sym => sym.id);
	}

	constructor(name) {
		super();

		this._name = name;
		this._width = Config.reels[this._name].width;
		this._height = Config.reels[this._name].height;

		this._reel = Config.reels[this._name].symbols;
		this._spinStop = Config.reels[this._name].initialStop;
		this._currentIndex = this.resolveIndex(this._spinStop - 1);

		this.setup();

		event.listenTo(ReelEvent.ON_START_SPINNING, ({ spinStop }) => {
			this.onStartSpinning(spinStop);
		});

		event.listenTo(ReelEvent.ON_QUICKSTOP, () => {
			this.onQuickstop();
		});
	}

	setup() {
		const mask = new PIXI.Graphics();
		mask.beginFill(0xFFFFFF);
		mask.drawRect(this.position.x, this.position.y, this._width, this._height);
		mask.endFill();
		this.addChild(mask);
		this.mask = mask;

		let offset = -Symbol.height;
		this._startPosition = offset;

		let index = this._currentIndex;
		for (let i = 0; i < 4; i++) {
			const symbol = new Symbol();
			symbol.id = SymbolId[this._reel[this.resolveIndex(index)]];
			symbol.default();

			symbol.anchor.x = .5;
			symbol.position.x = this._width * .5;
			symbol.position.y = offset;
			this.addChild(symbol);
			this._symbols.push(symbol);

			offset += Symbol.height;
			index += 1;
		}
	}

	onStartSpinning(spinStop) {
		this._spinStop = spinStop;
		this._animationTick = 0;
		this._animationState = ReelAnimationStates.SPINNING;
	}

	onQuickstop() {
		this.onStartStopping();
	}

	onStartStopping() {
		this._currentIndex = this._spinStop + 3;
		this._animationState = ReelAnimationStates.STOPPING;
		event.dispatch(KeypadEvent.ON_DEACTIVATE_SPIN);
	}

	onReelStop() {
		this._animationState = ReelAnimationStates.IDLE;
		event.dispatch(ReelEvent.ON_STOP);
	}

	resolveIndex(index) {
		if (index < 0) {
			index += this._reel.length;
		} else if (index >= this._reel.length) {
			index -= this._reel.length;
		}

		return index;
	}

	updateSpinAnimation(dt) {
		if (this._symbols[0].position.y >= this._startPosition + Symbol.height) {

			const symbol = this._symbols.pop();

			this._currentIndex = this.resolveIndex(this._currentIndex - 1);
			symbol.id = SymbolId[this._reel[this._currentIndex]];
			symbol.default();

			const diff = this._symbols[0].position.y - (this._startPosition + Symbol.height);
			symbol.position.y = this._startPosition + diff;

			this._symbols.unshift(symbol);
		}

		// Move symbols
		for (let i = 0; i < this._symbols.length; i++) {
			this._symbols[i].position.y += dt * Reel.MAX_SPEED;
		}
	}

	update(dt) {

		if (this._animationState !== ReelAnimationStates.IDLE) {

			this._animationTick += dt;

			switch(this._animationState) {
				case ReelAnimationStates.SPINNING:
					const nt = this._animationTick / Reel.SPIN_DURATION;
					if (nt >= 1) {
						return this.onStartStopping();
					}

					this.updateSpinAnimation(dt);

					break;
				case ReelAnimationStates.STOPPING:
					if (this._currentIndex === this._spinStop) {
						const diff = (this._startPosition + Symbol.height) - this._symbols[0].position.y;
						if (dt > diff) {
							dt = diff;
						}
					} else if (this._currentIndex === this.resolveIndex(this._spinStop - 1)) {
						return this.onReelStop();
					}

					this.updateSpinAnimation(dt);

					break;
			}
		}
	}
}

class ReelFrame extends PIXI.Container {
	constructor() {
		super();
		this.setup();
	}

	setup() {
		const frame = game.sprite('reel');
		this.addChild(frame);
	}
}

class KeypadEvent {
	static ON_PRESS_SPIN = 'KEYPAD.ON_PRESS_SPIN';
	static ON_ACTIVATE_SPIN = 'KEYPAD.ON_ACTIVATE_SPIN';
	static ON_DEACTIVATE_SPIN = 'KEYPAD.ON_DEACTIVATE_SPIN';
}

class Keypad extends PIXI.Container {

	_winField = 0;
	_balanceField = 0;
	_spinButton = null;

	constructor() {
		super();
		this.setup();

		event.listenTo(KeypadEvent.ON_ACTIVATE_SPIN, () => {
			this.activateSpin();
		});

		event.listenTo(KeypadEvent.ON_DEACTIVATE_SPIN, () => {
			this.deactivateSpin();
		});
	}

	setup() {
		const spinButton = game.sprite('play');
		spinButton.scale.x = spinButton.scale.y = .75;

		spinButton.interactive = true;
		spinButton.buttonMode = true;
		spinButton.on('click', () => {
			this.onPressSpin();
		});

		this.addChild(spinButton);
		this._spinButton = spinButton;

		// let textConfig = {
		// 	fontFamily: 'Arial', 
		// 	fontSize: 16, 
		// 	fill : 0xffffff
		// };

		// let balanceLabel = new PIXI.Text('BALANCE', textConfig);
		// this.addChild(balanceLabel);

		// let winLabel = new PIXI.Text('WIN', textConfig);
		// this.addChild(winLabel);
	}

	onPressSpin() {
		this.deactivateSpin();
		event.dispatch(KeypadEvent.ON_PRESS_SPIN);
	}

	deactivateSpin() {
		game.setTexture(this._spinButton, 'play_disabled');
		this._spinButton.interactive = false;
		this._spinButton.buttonMode = false;
	}

	activateSpin() {
		game.setTexture(this._spinButton, 'play');
		this._spinButton.interactive = true;
		this._spinButton.buttonMode = true;
	}
}

class BaseGameScene extends PIXI.Container {

	_bet = -1;
	_spinStop = -1;
	_reel = null;
	_keypad = null;

	constructor() {
		super();
		this.setup();

		this._bet = Config.basebet;

		event.listenTo(KeypadEvent.ON_PRESS_SPIN, () => {
			this.spin();
		});

		event.listenTo(ReelEvent.ON_STOP, () => {
			this.playWinPresentation();
		});
	}

	setup() {
		const reelFrame = new ReelFrame();
		reelFrame.pivot.x = reelFrame.width * .5;
		reelFrame.position.x = Game.width * .5;
		reelFrame.position.y = 50;
		this.addChild(reelFrame);

		const reel = new Reel(Object.keys(Config.reels)[0]);
		reel.pivot.x = reel.width * .5;
		reel.position.x = Game.width * .5;
		reel.position.y = 56;
		this.addChild(reel);
		this._reel = reel;

		const keypad = new Keypad();
		keypad.pivot.x = keypad.width * .5;
		keypad.position.x = Game.width * .5;
		keypad.position.y = Game.height * .75;
		this.addChild(keypad);
		this._keypad = keypad;
	}

	spin() {
		if (!this._reel.isSpinning) {
			// Get random number
			this._spinStop = Math.floor(Math.random() * Config.reels['reel0'].symbols.length);
			event.dispatch(ReelEvent.ON_START_SPINNING, { spinStop: this._spinStop });

			game.timer.delay(100, () => {
				event.dispatch(KeypadEvent.ON_ACTIVATE_SPIN);
			});
		} else {
			event.dispatch(ReelEvent.ON_QUICKSTOP);
		}
	}

	playWinPresentation() {

		// Evaluate the win (this would come from server side)
		const outcome = this._reel.visibleSymbols.reduce((result, element) => {
			if (!result[element]) { result[element] = 0; }
			result[element] += 1;

			return result;
		}, {});
		const win = (3 - Object.keys(outcome).length) > 0 ? ((4 - Object.keys(outcome).length) * this._bet) : 0;

		console.log(win);

		this.onWinPresentationFinished();
	}

	onWinPresentationFinished() {
		event.dispatch(KeypadEvent.ON_ACTIVATE_SPIN);
	}

	update(dt) {
		this._reel.update(dt);
	}
}

class Event {
	constructor() {
		this._listeners = {};
	}

	listenTo(event, cb) {
		if (!this._listeners[event]) {
			this._listeners[event] = [];
		}
		this._listeners[event].push(cb);
	}

	dispatch(event, data) {
		if (this._listeners[event]) {
			for (let i = 0; i < this._listeners[event].length; i++) {
				this._listeners[event][i](data);
			}
		}
	}
}

class Timer {

	_delayedCalls = [];

	delay(t, cb, props, ctx = this) {

		if (t < 0) { return console.error('Delay should be equal or greater than 0'); }
		if (!cb) { return console.error('Callback should be defined'); }
		if (!props) { props = []; }

		this._delayedCalls.push({
			delay: t,
			time: 0,
			callback: cb.bind(ctx, ...props)
		});
	}

	update(dt) {

		const finished = [];

		for (let i = 0; i < this._delayedCalls.length; i++) {
			const delayedCall = this._delayedCalls[i];

			delayedCall.time += dt;
			if (delayedCall.delay <= delayedCall.time) {
				delayedCall.callback();
				finished.push(i);
			}
		}

		this.cleanup(finished);
	}

	cleanup(items) {
		for (let i = 0; i < items.length; i++) {
			this._delayedCalls.splice(items[i], 1);
		}
	}
}

class Game {
	static width = 1136;
	static height = 640;

	_renderer = null;
	_stage = null;
	_timer = null;

	_isRunning = false;
	_lastTick = 0;

	get timer() {
		return this._timer;
	}

	constructor(props) {
		this._renderer = new PIXI.WebGLRenderer(Game.width, Game.height);
		this._timer = new Timer();
		document.body.appendChild(this._renderer.view);
		this.loadAssets(props&&props.onload);
	}

	loadAssets(cb) {
		const textureNames = [];
		const baseURL = 'images/';

		textureNames.push('play');
		textureNames.push('play_disabled');
		textureNames.push('reel');
		textureNames.push('win_bg');

		for (let i = 0; i < textureNames.length; i++) {
			PIXI.loader.add(textureNames[i], baseURL + textureNames[i] + '.png');
		}

		// Load symbol assets
		for (let i = 1; i <= 5; i++) {
			const name = 'sym' + i;
			textureNames.push(name);
			PIXI.loader.add(name, baseURL + name + '.png');
		}

		PIXI.loader.load(function(loader,res) {
			// Access assets by name, not url
			const keys = Object.keys(res);
			for (let i = 0; i < keys.length; i++) {
				const texture = res[keys[i]].texture;
				if (!texture) continue;
				PIXI.utils.TextureCache[keys[i]] = texture;
			}

			// Assets are loaded and ready!
			cb && cb();
			this.start();
		}.bind(this));
	}

	start() {	
		this._isRunning = true;
		this._lastTick = Date.now();
		update.bind(this)();

		function update(){
			if (!this._isRunning) return;

			const currentTick = Date.now();
			const dt = currentTick - this._lastTick;
			this._lastTick = currentTick;

			this.tick(dt);
			this.render();
			requestAnimationFrame(update.bind(this));
		}
	}

	render() {
		this._renderer.render(this._stage);
	}

	tick(dt) {
		this._stage.update(dt);
		this._timer.update(dt);
	}

	sprite(name) {
		return new PIXI.Sprite(PIXI.utils.TextureCache[name]);
	}

	setTexture(sp, name) {
		sp.texture = PIXI.utils.TextureCache[name];
		if (!sp.texture) console.warn('Texture ' + name + ' doesn\'t exist!');
	}

	loadScene(scene) {
		this._stage = scene;
	}
}

window.onload = function() {
	window.game = new Game({
		onload: function() {
			game.loadScene(new BaseGameScene());
		}
	});
	window.event = new Event();
}
