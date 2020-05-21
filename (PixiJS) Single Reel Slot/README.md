Summary
-------
Developed by Joaquín Campos around September 2019.

Used PixiJS (v3) framework for a quick prototyping.

Features
--------

  * Mouse interaction.
  * Reel spin implementation (normal spin and quickstop).
  * FSM for reel (idle, spinning and stopping states).
  * Event system.
  * Pool of symbols (for an optimized resource consumption).
  * Sprite animation (by frames).
  * Assets loading.
  * Decoupled components.

Instructions
------------

Start the game with a simple server like http-server. Open a web browser and load the index.html file from the address configured in the server (usually http://localhost:8080/index.html).

The game shows a single reel and a spin button. Pressing the button makes the reel to start spinning, pressing it again quickstops the reel. Normal spin duration is 3 seconds.