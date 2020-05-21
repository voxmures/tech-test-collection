Summary
-------
Developed by Joaquín Campos on 21/09/2019 in around 4 hours (assignment limitation).

Used PixiJS (v3) framework for a quick prototyping.

Features
--------

  * Mouse interaction.
  * Animations by code (Spin & Fade In/Out).
  * Assets loading.
  * Game Flow implementation (Pick -> Start -> Spin animation -> Win presentation -> Reset).
  * Decoupled components.

Instructions
------------

Start the game with a simple server like http-server. Open a web browser and load the index.html file from the address configured in the server (usually http://localhost:8080/index.html).

The game let the player pick among 9 different numbers (1-9) and plays a spin when the button is pressed. If the randomly generated number matches with the chosen one, then a win animation is shown.