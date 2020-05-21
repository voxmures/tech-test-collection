Summary
-------

Developed by Joaquín Campos around October 2018. The assignment was described [here](https://gist.github.com/Tazer/6f0f2f4dd71f32edd154250a81b300aa).

Used Nuxt.js (Vue.js framework) for a quick prototyping. Used vue-material plugin for the most basic graphical elements.

The pictures shown in the background were taken by me during my trip in China on 2017.

Features
--------

  * Use of Vue components for rendering the quiz (Quiz and QuizStep).
  * Use of Vuex (State Management Pattern) to centralize data.
  * API connector implementation (it just fakes a connection with a server, delivering the data to the frontend app).
  * Use of asynchronous methods (async/await).
  * Parallax scrolling CSS effect implementation.

Instructions
------------

``` bash
# install dependencies
$ npm install # Or yarn install

# serve with hot reload at localhost:3000
$ npm run dev

# build for production and launch server
$ npm run build
$ npm start

# generate static project
$ npm run generate
```

For detailed explanation on how things work, checkout the [Nuxt.js docs](https://github.com/nuxt/nuxt.js).

The application shows a quiz with different single-answer questions. At the end, the user can write the email address to get the result of the quiz, that is shown in a dialog.