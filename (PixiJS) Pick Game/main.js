class OutcomeComponent extends PIXI.Container {
	constructor() {
		super();
		this.initComponents();

		this.DURATION = 3000;
		this.SPEED = 100;

		this.currentSymbol = -1;
		this.finalSymbol = -1;
		this.symbols = [
			"sym1",
			"sym2",
			"sym3",
			"sym4",
			"sym5",
			"sym6",
			"sym7",
			"sym8",
			"sym9"
		];

		this.isPlayingPresentation = false;
		this.animationTicks = 0;
		this.cb = null;
	}

	initComponents() {
		let blank = game.sprite("blank");
		blank.scale.x = blank.scale.y = .8;
		this.addChild(blank);

		let outcome = game.sprite("mystery");
		outcome.scale.x = outcome.scale.y = .8;
		outcome.position.x = this.width / 2;
		outcome.position.y = this.height / 2;
		outcome.anchor.x = outcome.anchor.y = .5;
		this.addChild(outcome);
		this.outcomeSprite = outcome;
	}

	playOutcomePresentation(outcome, cb) {
		this.finalSymbol = outcome - 1;
		this.cb = cb;

		this.currentSymbol = 0;

		this.isPlayingPresentation = true;
		this.animationTicks = 0;
		this.speed = this.SPEED;
	}

	stopOutcomePresentation() {
		this.isPlayingPresentation = false;

		// Show the final symbol
		this.currentSymbol = this.finalSymbol;
		game.setTexture(this.outcomeSprite, this.symbols[this.currentSymbol]);

		this.cb();
	}

	update(dt) {
		if (this.isPlayingPresentation) {

			this.animationTicks += dt;

			// If the presentation is finished, stop it
			if (this.animationTicks >= this.DURATION) {
				return this.stopOutcomePresentation();
			}

			// Change the symbol in the box according to the speed (carousel)
			let num = Math.floor(this.animationTicks / this.SPEED) % 9;
			if (num !== this.currentSymbol) {
				this.currentSymbol = num;
			}

			// Set the texture of the sprite
			game.setTexture(this.outcomeSprite, this.symbols[this.currentSymbol]);
		}
	}
}

class SymbolsComponent extends PIXI.Container {
	constructor(parent) {
		super();
		this.initComponents();

		this.parent = parent;
	}

	initComponents() {
		let symbols = [
			"sym1",
			"sym2",
			"sym3",
			"sym4",
			"sym5",
			"sym6",
			"sym7",
			"sym8",
			"sym9"
		];

		// Add symbols
		for (let i = 0; i < symbols.length; i++) {
			let symbol = game.sprite(symbols[i]);
			symbol.scale.x = symbol.scale.y = .33;
			symbol.position.x = i * (symbol.width + symbol.width * .25);

			symbol.interactive = true;
			symbol.buttonMode = true;
			symbol.on("click", () => {
				this.onSymbolClicked(i);
			});

			this.addChild(symbol);
		}
	}

	onSymbolClicked(num) {
		// Highlight clicked symbol by tinting the others
		for (let i = 0; i < this.children.length; i++) {
			if (i !== num) {
				this.children[i].tint = 0xA9A9A9;
			} else {
				this.children[i].tint = 0xFFFFFF;
			}
		}

		// Update the bet in parent scene
		this.parent.onSymbolClicked(num + 1);
	}

	deactivate() {
		// Deactivate the symbols
		for (let i = 0; i < this.children.length; i++) {
			this.children[i].interactive = false;
			this.children[i].buttonMode = false;
		}
	}


	reset() {
		// Activate the symbols again
		for (let i = 0; i < this.children.length; i++) {
			this.children[i].interactive = true;
			this.children[i].buttonMode = true;
			this.children[i].tint = 0xFFFFFF;
		}
	}
}

class WinComponent extends PIXI.Container {
	constructor() {
		super();
		this.initComponents();

		this.DURATION = 5000;
		this.FADE_DURATION = 200;

		this.isPlayingPresentation = false;
		this.animationTicks = 0;
		this.delay = 0;
		this.cb = null;
	}

	initComponents() {
		let win = game.sprite("win");
		win.alpha = 0;
		this.addChild(win);
		this.win = win;
	}

	playWinPresentation(delay, cb) {
		this.isPlayingPresentation = true;
		this.delay = delay;
		this.cb = cb;

		this.animationTicks = 0;
	}

	stopWinPresentation() {
		this.isPlayingPresentation = false;
		this.cb();
	}

	update(dt) {
		if (this.isPlayingPresentation) {
			this.animationTicks += dt;

			// Play the animation after the delay
			if (this.animationTicks >= this.delay) {

				// If the presentation finished...
				if (this.animationTicks >= this.DURATION + this.FADE_DURATION + this.delay) {
					
					// Fade out the win sprite
					this.win.alpha = 1 - ((this.animationTicks - (this.DURATION + this.FADE_DURATION + this.delay)) / this.FADE_DURATION);

					if (this.win.alpha <= 0) {
						this.win.alpha = 0;
						this.stopWinPresentation();
					}
				} else {
					// Fade in the win sprite
					this.win.alpha = Math.min(1, (this.animationTicks - this.delay) / this.FADE_DURATION);
				}
			}
		}
	}
}

class MainScene extends PIXI.Container {
	constructor() {
		super();
		this.initComponents();

		this.outcome = -1;	// Outcome of the game
		this.symbolClicked = -1;	// Symbol bet
	}

	initComponents() {
		// Add the background
		this.addChild(game.sprite("Background"));

		// Add outcome component
		let outcomeComponent = new OutcomeComponent();
		outcomeComponent.pivot.x = outcomeComponent.width / 2;
		outcomeComponent.position.x = game.width / 2;
		outcomeComponent.position.y = 50;
		this.addChild(outcomeComponent);
		this.outcomeComponent = outcomeComponent;

		// Add symbols component
		let symbolsComponent = new SymbolsComponent(this);
		symbolsComponent.pivot.x = symbolsComponent.width / 2;
		symbolsComponent.position.x = game.width / 2;
		symbolsComponent.position.y = 350;
		this.addChild(symbolsComponent);
		this.symbolsComponent = symbolsComponent;

		// Add spin button
		let button = game.sprite("button");
		button.scale.x = button.scale.y = .8;
		button.position.x = game.width / 2;
		button.position.y = 500;
		button.anchor.x = .5;

		button.interactive = false;
		button.buttonMode = false;
		button.tint = 0xA9A9A9;
		button.on("click", () => { 
			this.spin();
		});
		this.spinButton = button;

		this.addChild(button);

		// Add lose sprite
		let lose = game.sprite("lose");
		lose.anchor.x = lose.anchor.y = .5;
		lose.position.x = game.width / 2;
		lose.position.y = 300;
		lose.alpha = 0;
		this.addChild(lose);
		this.lose = lose;

		// Add win component
		let winComponent = new WinComponent();
		this.addChild(winComponent);
		this.winComponent = winComponent;
	}

	onSymbolClicked(num) {
		this.symbolClicked = num;

		// Activate spin button
		this.spinButton.interactive = true;
		this.spinButton.buttonMode = true;
		this.spinButton.tint = 0xFFFFFF;
	}

	spin() {
		// Hide lose message
		this.lose.alpha = 0;

		// Deactivate buttons
		this.spinButton.interactive = false;
		this.spinButton.buttonMode = false;
		this.spinButton.tint = 0xA9A9A9;

		this.symbolsComponent.deactivate();

		// Get random number
		this.outcome = Math.floor(Math.random() * 9 + 1);
		// this.outcome = 1;
		this.outcomeComponent.playOutcomePresentation(this.outcome, () => {
			this.onOutcomePresentationFinished();
		});
	}

	onOutcomePresentationFinished() {
		if (this.symbolClicked === this.outcome) {
			// Play the win presentation if it is a win
			this.winComponent.playWinPresentation(1000, () => {
				this.onWinPresentationFinished();
			});
		} else {
			// Show the lose message if it is a lose and reset the game
			this.lose.alpha = 1;
			this.symbolsComponent.reset();
		}
	}

	onWinPresentationFinished() {
		// Reset the game when win presentation finished
		this.symbolsComponent.reset();
	}

	update(dt) {
		this.outcomeComponent.update(dt);
		this.winComponent.update(dt);
	}
}

class Game {

	constructor(props) {
		this.width = 1136;
		this.height = 640;

		this.renderer = new PIXI.WebGLRenderer(this.width, this.height);
		document.body.appendChild(this.renderer.view);
		this.stage = null;
		this.loadAssets(props&&props.onload);
	}

	loadAssets(cb) {
		let textureNames = [];
		let baseURL = "images/";

		textureNames.push("Background");
		textureNames.push("blank");
		textureNames.push("button");
		textureNames.push("mystery");
		textureNames.push("win");
		textureNames.push("lose");

		for (let i = 0; i < textureNames.length; i++) {
			PIXI.loader.add(textureNames[i], baseURL + textureNames[i] + ".png");
		}

		// Load symbol assets
		for (let i = 1; i <= 9; i++) {
			let name = "sym" + i;
			textureNames.push(name);
			PIXI.loader.add(name, baseURL + name + ".png");
		}

		PIXI.loader.load(function(loader,res) {
			// Access assets by name, not url
			let keys = Object.keys(res);
			for (let i = 0; i < keys.length; i++) {
				var texture = res[keys[i]].texture;
				if (!texture) continue;
				PIXI.utils.TextureCache[keys[i]] = texture;
			}

			// Assets are loaded and ready!
			cb && cb();
			this.start();
		}.bind(this));
	}

	start() {	
		this.isRunning = true;
		this.lastTick = Date.now();
		update.bind(this)();

		function update(){
			if (!this.isRunning) return;

			let currentTick = Date.now();
			let dt = currentTick - this.lastTick;
			this.lastTick = currentTick;

			this.tick(dt);
			this.render();
			requestAnimationFrame(update.bind(this));
		}
	}

	render() {
		this.renderer.render(this.stage);
	}

	tick(dt) {
		this.stage.update(dt);
	}

	sprite(name) {
		return new PIXI.Sprite(PIXI.utils.TextureCache[name]);
	}

	setTexture(sp, name) {
		sp.texture = PIXI.utils.TextureCache[name];
		if (!sp.texture) console.warn("Texture '"+name+"' doesn't exist!")
	}

	loadScene(scene) {
		this.stage = scene;
	}
}

window.onload = function() {
	window.game = new Game({
		onload: function() {
			game.loadScene(new MainScene());
		}
	});
}
