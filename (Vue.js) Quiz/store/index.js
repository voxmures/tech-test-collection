import Vuex from 'vuex'

const createStore = () => {
  return new Vuex.Store({
    state: () => ({
      steps: [],
      selection: []
    }),
    mutations: {
      SET_STEPS (state, steps) {
        state.steps = steps
      },
      SELECT (state, { index, value }) {
        state.selection[index] = value
      }
    },
    actions: {
      async FETCH_STEPS ({ commit }) {
        const steps = await this.$axios.$get('/api/quiz')
        commit('SET_STEPS', steps)
      },
      async SEND ({ state }, email) {
        return this.$axios.$post('/api/quiz', {
          email: email,
          selection: state.selection
        })
      }
    }
  })
}

export default createStore
