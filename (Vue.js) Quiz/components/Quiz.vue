<template>
  <div class="wrapper">
    <div class="section title">
      <div class="header">
        <p class="md-display-3">FastTrack Code Test</p>
        <p class="md-display-2">by Joaquín Campos</p>
        <img class="slide" src="/images/dragon.png"/>
      </div>
      <div class="action">
        <span class="md-headline">Press to start the quiz or scroll down</span>
        <div class="btn">
          <md-button class="md-raised md-icon-button" @click="scrollTo(0)">
            <md-icon class="md-size-2x">expand_more</md-icon>
          </md-button>
        </div>
      </div>
      <div class="fixed"></div>
    </div>
    <div class="section" v-for="({ question, answers }, index) in steps" :id="`q${index}`">
      <quiz-step
        :index="index"
        :question="question"
        :answers="answers"
        @answered="scrollTo(index + 1)"/>
      <div :class="['parallax', `bg-${index}`]"></div>
    </div>
    <div class="section" id="form">
      <span class="md-display-1">Send your answers and get your results!</span>
      <div class="form-group">
        <input type="email" class="form-control" placeholder="Enter email" v-model="email" />
        <md-button class="md-raised md-primary" @click="send" :disabled="sendDisabled">Send</md-button>
      </div>
    </div>
    <md-dialog-alert
      class="custom-dialog"
      :md-active.sync="showResult"
      :md-content="dialogTemplate()"
      md-confirm-text="Cool!" />
  </div>
</template>

<script>
import { mapState } from 'vuex'

import QuizStep from './QuizStep'

export default {
  components: {
    QuizStep
  },
  computed: {
    ...mapState({
      steps: state => state.steps,
      selection: state => state.selection
    }),
    sendDisabled () {
      return !this.email || this.selection.length < 3
    }
  },
  data () {
    return {
      email: '',
      result: {},
      showResult: false
    }
  },
  methods: {
    async send () {
      const { score, betterThan } = await this.$store.dispatch('SEND', this.email)
      this.result = { score, betterThan: parseFloat(betterThan).toFixed(2) }
      this.showResult = true
    },
    scrollTo (i) {
      let id = `q${i}`
      if (i === this.steps.length) id = 'form'
      const element = document.getElementById(id)
      window.scrollTo({
        'behavior': 'smooth',
        'left': 0,
        'top': element.offsetTop
      })
    },
    dialogTemplate () {
      return (`
        <img src="/images/envelope.png" />
        <p>You got ${this.result.score} right answers</p>
        <p>You are better than the <span class="md-display-1 red">${this.result.betterThan}%</span> of users</p>
      `)
    }
  },
  // Lifecycle Hooks
  mounted () {
    const wrapper = document.querySelector('.wrapper')
    const dragon = document.querySelector('.slide')
    wrapper.addEventListener('mousemove', (e) => {
      const w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0)
      const x = e.clientX
      const y = e.clientY
      dragon.style.webkitTransform = `translateX(${(x - (w / 2)) / 50}%) translateY(${y / 50}%)`
      dragon.style.transform = `translateX(${(x - (w / 2)) / 50}%) translateY(${y / 50}%)`
    })
  }
}
</script>

<style lang="scss" scoped>

.wrapper {
  min-height: 100vh;
  height: 100vh;
  width: 100vw;

  display: flex;
  flex-direction: column;
  align-items: center;
}

.parallax {
  /* Full height */
  height: 100%;
  width: 100vw;

  /* Create the parallax scrolling effect */
  background-attachment: fixed;
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;

  position: absolute;
  z-index: -1;

  &.bg-0 {
    background-image: url("/images/greatwall.jpg");
  }

  &.bg-1 {
    background-image: url("/images/huashan.jpg");
  }

  &.bg-2 {
    background-image: url("/images/giantbuddha.jpg");
  }
}

.fixed {
  /* Full height */
  height: 100%;
  width: 100vw;

  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;

  background-image: url("/images/blurred.jpg");

  position: absolute;
  z-index: -1;
}

.section {
  width: 80%;

  display: flex;
  flex-direction: column;

  flex: 0 0 100%;
  align-items: center;
  justify-content: center;
}

.title {

  .header {
    margin-top: 100px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    .slide {
      margin-top: 25px;
    }
  }

  .action {
    margin-top: auto;
    margin-bottom: 40px;
    display: flex;
    flex-direction: column;

    .btn {
      margin-top: 20px;
    }
  }

  .parallax {
    grid-column: 0;
  }
}

.form-group {
  margin-top: 30px;
  padding: 10px 18px;

  .form-control {
    width: 100%;
    padding: 10px 18px;
    background-color: transparent;
    border: 1px solid #e3e3e3;
    border-radius: 30px;
    color: #2c2c2c;
    line-height: normal;
    font-size: .8571em;
    transition: color .3s ease-in-out,border-color .3s ease-in-out,background-color .3s ease-in-out;
    box-shadow: none;
  }

  .form-control:focus {
    border: 1px solid #f96332;
    box-shadow: none;
    outline: 0!important;
    color: #2c2c2c;
  }

  .md-button {
    border-radius: 30px;
  }
}
</style>

<style lang="scss">
.custom-dialog {
  text-align: center;

  .md-dialog-content {
    img {
      margin-bottom: 25px;
    }
  }

  .md-dialog-actions {
    padding-left: 8px;
    justify-content: center;
  }
}

.red {
  color: #d10d0d !important;
}
</style>