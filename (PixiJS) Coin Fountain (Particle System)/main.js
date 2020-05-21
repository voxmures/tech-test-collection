// ----- Start of the assigment ----- //

class Particle {

	constructor(config, emitter) {
		this.sp = game.sprite(config.texture || PIXI.Texture.EMPTY);
		this.sp.pivot.x = this.sp.width / 2;
		this.sp.pivot.y = this.sp.height / 2;
		this.frame = 0;

		this.velocity = config.velocity || new PIXI.Point(0, 0);

		this.lifetime = config.lifetime || 0;
		this.age = 0;

		this.emitter = emitter;
	}

	update(dt) {

		this.age += dt;
		if (this.age >= this.lifetime) {
			// If the particle finished, recycle it
			this.emitter.recycle(this);
			return;
		}

		let nt = this.age / this.lifetime;

		// Set a new texture on a sprite particle
		let f = Math.floor(nt * 8);
		if (f !== this.frame) {
			this.frame = f;
			game.setTexture(this.sp, "CoinsGold00" + this.frame);
		}

		// Animate position
		this.sp.x += dt * this.velocity.x;
		this.sp.y += dt * this.velocity.y;

		// Animate scale
		this.sp.scale.x = this.sp.scale.y = nt;

		// Animate alpha
		this.sp.alpha = nt;

		// Animate rotation
		this.sp.rotation = nt * Math.PI * 2;
	}
}

class ParticleSystem extends PIXI.Container {

	constructor() {
		super();
		// Set start and duration for this effect in milliseconds
		this.start    = 0;
		this.duration = 10000;

		// Set spawning variables
		this.emitterPosition = new PIXI.Point(400, 225);
		this.chanceSpawn = 0.8;
		this.maxParticles = 50;
		this.particlesPool = [];
		this.activeParticles = [];

		this.spawnTime = this.duration;
		this.prevTime = -1;
		this.isActive = true;
	}
	
	animTick(nt,lt,gt) {
		// Every update we get three different time variables: nt, lt and gt.
		//   nt: Normalized time in procentage (0.0 to 1.0) and is calculated by
		//       just dividing local time with duration of this effect.
		//   lt: Local time in milliseconds, from 0 to this.duration.
		//   gt: Global time in milliseconds,

		if (this.isActive) {

			let dt = this.prevTime < 0 ? lt : gt - this.prevTime;
			this.prevTime = gt;

			// Update active particles
			for (let i = 0; i < this.activeParticles.length; i++) {
				this.activeParticles[i].update(dt);
			}

			this.spawnTime -= dt;
			if (this.spawnTime > 0) {
				// If it is on spawning time and it did not reach the maxParticles, try to create one
				if (this.activeParticles.length < this.maxParticles) {

					// Create particle randomly
					if (Math.random() >= this.chanceSpawn) {
						return;
					}

					let particle;
					
					if (this.particlesPool.length > 0) {
						// Try to reuse a particle if there is any free
						particle = this.particlesPool.pop();
					} else {
						// If not, create a new one
						particle = new Particle({
							texture: "CoinsGold000",
							lifetime: 1000
						}, this);
					}

					// Reset texture
					particle.frame = 0;

					// Reset age
					particle.age = 0;

					// Set alpha & scale
					particle.sp.alpha = 0;
					particle.sp.scale.x = particle.sp.scale.y = 0;

					// Set spawn position
					particle.sp.x = this.emitterPosition.x;
					particle.sp.y = this.emitterPosition.y;

					// Get random destination (using 550 as an approximate radius that contains the game screen)
					let a = Math.random() * Math.PI * 2;
					let destx = 550 * Math.cos(a);
					let desty = 550 * Math.sin(a);

					// The velocity is calculated using the lifetime of the particle
					let velx = destx / particle.lifetime;
					let vely = desty / particle.lifetime;

					// Set velocity
					particle.velocity.x = velx;
					particle.velocity.y = vely;

					// Add the sprite particle to our particle effect
					this.addChild(particle.sp);

					// Save a reference to the sprite particle
					this.activeParticles.push(particle);
				}
			} else {
				// If there are no more particles to spawn or to update, kill the particle system
				if (this.activeParticles.length === 0) {
					this.isActive = false;
					this.kill();
				}
			}
		}
	}

	recycle(p) {
		// Recycle the particles to avoid unnecessary memory consumption
		let i = this.activeParticles.indexOf(p);
		if (i >= 0) {
			this.activeParticles.splice(i, 1);
			this.removeChild(p.sp);
			this.particlesPool.push(p);
		}
	}

	kill() {
		// Destroy the sprites, ensuring to free memory
		for (let i = 0; i < this.particlesPool.length; i++) {
			this.particlesPool[i].sp.destroy();
		}
		this.particlesPool = [];
	}
}

// ----- End of the assigment ----- //

class Game {
	constructor(props) {
		this.totalDuration = 0;
		this.effects = [];
		this.renderer = new PIXI.WebGLRenderer(800,450);
		document.body.appendChild(this.renderer.view);
		this.stage = new PIXI.Container();
		this.loadAssets(props&&props.onload);
	}
	loadAssets(cb) {
		let textureNames = [];
		// Load coin assets
		for (let i=0; i<=8; i++) {
			let num  = ("000"+i).substr(-3);
			let name = "CoinsGold"+num;
			let url  = "gfx/CoinsGold/"+num+".png";
			textureNames.push(name);
			PIXI.loader.add(name,url);
		}
		PIXI.loader.load(function(loader,res){
			// Access assets by name, not url
			let keys = Object.keys(res);
			for (let i=0; i<keys.length; i++) {
				var texture = res[keys[i]].texture;
				if ( ! texture) continue;
				PIXI.utils.TextureCache[keys[i]] = texture;
			}
			// Assets are loaded and ready!
			this.start();
			cb && cb();
		}.bind(this));
	}
	start() {	
		this.isRunning = true;
		this.t0 = Date.now();
		update.bind(this)();
		function update(){
			if ( ! this.isRunning) return;
			this.tick();
			this.render();
			requestAnimationFrame(update.bind(this));
		}
	}
	addEffect(eff) {
		this.totalDuration = Math.max(this.totalDuration,(eff.duration+eff.start)||0);
		this.effects.push(eff);
		this.stage.addChild(eff);
	}
	render() {
		this.renderer.render(this.stage);
	}
	tick() {
		let gt = Date.now();
		let lt = (gt-this.t0) % this.totalDuration;
		for (let i=0; i<this.effects.length; i++) {
			let eff = this.effects[i];
			if (lt>eff.start+eff.duration || lt<eff.start) continue;
			let elt = lt - eff.start;
			let ent = elt / eff.duration;
			eff.animTick(ent,elt,gt);
		}
	}
	sprite(name) {
		return new PIXI.Sprite(PIXI.utils.TextureCache[name]);
	}
	setTexture(sp,name) {
		sp.texture = PIXI.utils.TextureCache[name];
		if ( ! sp.texture) console.warn("Texture '"+name+"' don't exist!")
	}
}

window.onload = function(){
	window.game = new Game({onload:function(){
		game.addEffect(new ParticleSystem());
	}});
}
