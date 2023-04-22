new Vue({
  el: '#app',
  data () {
    return {
      loading: false,
      pokemonOptions: [],
      onlyShowCustomArt: false,
      selectedPokemon1: [],
      selectedPokemon2: [],
      fusionPokemon: [],
      toFusionPairs: []
    }
  },
  methods: {
    hasCustomArt (pokemon1, pokemon2) {
      return !!pokemonFuser.customBattlers[`${pokemon1.id}.${pokemon2.id}`]
    },
    updatePokemonOptions (value, update) {
      update(() => {
        if (!value) {
          this.pokemonOptions = pokemon
        } else {
          const search = value.toLowerCase()

          this.pokemonOptions = pokemon.filter(poke => poke.internalName.indexOf(search) > -1 || poke.name.indexOf(search) > -1)
        }
      })
    },
    resetFusions () {
      this.fusionPokemon = []

      // Doing this as performantly as possible.

      const addedPairsMap = {}
      const toFusionPairs = []

      for (let pokemon1 of this.selectedPokemon1) {
        for (let pokemon2 of this.selectedPokemon2) {
          const id1 = `${pokemon1.id}.${pokemon2.id}`
          const id2 = `${pokemon2.id}.${pokemon1.id}`

          if (!addedPairsMap[id1]) {
            addedPairsMap[id1] = true

            toFusionPairs.push([pokemon1, pokemon2])
          }

          if (!addedPairsMap[id2]) {
            addedPairsMap[id2] = true

            toFusionPairs.push([pokemon2, pokemon1])
          }
        }
      }

      this.toFusionPairs = toFusionPairs

      this.$refs.infiniteScroll.reset()
      this.$refs.infiniteScroll.resume()
      this.$refs.infiniteScroll.trigger()
    },
    async loadMoreFusions (index, done) {
      let numAdded = 0
      while (numAdded < 50 && this.toFusionPairs.length) {
        const pokemonPair = this.toFusionPairs.shift()
        
        if (this.onlyShowCustomArt && !this.hasCustomArt(...pokemonPair)) {
          continue;
        }

        this.fusionPokemon.push(await pokemonFuser.fusePokemon(...pokemonPair))

        numAdded++
      }

      if (!this.toFusionPairs.length) {
        this.$refs.infiniteScroll.stop()
      }

      done()
    }
  },
  async mounted () {
    this.loading = true

    await pokemonFuser.load()

    this.loading = false
  }
})