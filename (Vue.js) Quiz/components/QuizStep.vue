<template>
  <md-card>
    <md-card-header>
      <div class="md-title">
        {{ question }}
      </div>
    </md-card-header>
    <md-card-content>
      <div class="answers-container">
        <template v-for="(answer, i) in answers">
          <md-radio v-model="selected" :value="i" @change="select(i)">{{ answer }}</md-radio>
        </template>
      </div>
    </md-card-content>
  </md-card> 
</template>

<style scoped>
.md-card {
  width: 320px;
  margin: 4px;
  display: inline-block;
  vertical-align: top;
}

.md-title {
  text-align: left;
}

.answers-container {
  display: flex;
  flex-direction: column;
}

.md-radio {
  margin-top: 8px;
  margin-bottom: 8px;
}
</style>

<script>
export default {
  props: {
    index: {
      type: Number,
      required: true
    },
    question: {
      type: String,
      required: true
    },
    answers: {
      type: Array,
      required: true
    }
  },
  data () {
    return {
      selected: null
    }
  },
  methods: {
    select (value) {
      this.$store.commit('SELECT', { index: this.index, value: value })
      this.$emit('answered')
    }
  }
}
</script>