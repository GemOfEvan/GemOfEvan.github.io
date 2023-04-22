const pokemonFuser = {
  pokemonDataCache: {},
  fusionPokemonCache: {},
  customBattlers: null,
  async load () {
    const customBattlerData = await (await fetch('https://api.github.com/repos/Aegide/custom-fusion-sprites/git/trees/main?recursive=1')).json()

    this.customBattlers = Object.fromEntries(
      customBattlerData.tree
        .filter(file => file.path.startsWith('CustomBattlers/'))
        .map(file => [
          file.path.substring(15, file.path.length - 4),
          `https://raw.githubusercontent.com/Aegide/custom-fusion-sprites/master/${file.path}`
        ])
    )
  },
  async fetchPokemonData (pokemon) {
    if (this.pokemonDataCache[pokemon.internalName]) {
      return this.pokemonDataCache[pokemon.internalName]
    }

    const remoteData = await (await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon.internalName}`)).json()
    
    let types = pokemon.types?.slice() ?? remoteData.types.map(typeObject => typeObject.type.name)

    if (types[0] === 'normal' && types[1] === 'flying') {
      types = ['flying']
    }

    const stats = Object.fromEntries(
      (pokemon.stats ?? remoteData.stats)
        .map(statObject => statObject.base_stat)
        .map((stat, index) => [
          [
            'hp',
            'atk',
            'def',
            'spatk',
            'spdef',
            'spe'
          ][index],
          stat
        ])
    )

    let abilities = (pokemon.abilities ?? remoteData.abilities).map(abilityObject => ({
      ability: abilityObject.ability.name
        .split(/[- ]/g)
        .map(term => term.substring(0, 1).toUpperCase() + term.substring(1))
        .join(' '),
      isHidden: abilityObject.is_hidden
    }))

    if (pokemon.shouldSwapAbilities) {
      [abilities[0], abilities[1]] = [abilities[1], abilities[0]]
    }

    const data = {
      types,
      stats,
      abilities,
      name: pokemon.name,
      id: pokemon.id
    }

    this.pokemonDataCache[pokemon.internalName] = data

    return data
  },
  async fusePokemon (pokemon1, pokemon2) {
    const pokemonData1 = await this.fetchPokemonData(pokemon1)
    const pokemonData2 = await this.fetchPokemonData(pokemon2)

    const id = `${pokemonData1.id}.${pokemonData2.id}`

    if (this.fusionPokemonCache[id]) {
      return this.fusionPokemonCache[id]
    }

    const stats = this.fuseStats(pokemonData1.stats, pokemonData2.stats)
    const reverseStats = this.fuseStats(pokemonData2.stats, pokemonData1.stats)

    const types = pokemonData1.id === pokemonData2.id && pokemon1.selfFusionType
      ? pokemon1.selfFusionType
      : this.fuseTypes(pokemonData1.types, pokemonData2.types)

    const fusionPokemon = {
      id,
      dexNumber: pokemonData1.id + 420 * pokemonData2.id,
      statsAndDeltas: Object.fromEntries(
        Object.keys(stats)
          .map(statKey => [
            statKey,
            {
              stat: stats[statKey],
              delta: stats[statKey] - reverseStats[statKey]
            }
          ])
      ),
      types,
      hasCustomArt: !!this.customBattlers[id],
      imageUrl: this.customBattlers[id] ?? `https://raw.githubusercontent.com/Aegide/autogen-fusion-sprites/master/Battlers/${pokemonData1.id}/${id}.png`,
      ...this.fuseAbilities(pokemonData1.abilities, pokemonData2.abilities),
      pokemonData1,
      pokemonData2
    }

    this.fusionPokemonCache[id] = fusionPokemon

    return fusionPokemon
  },
  fuseStats(stats1, stats2) {
    const stats = {
      hp: Math.floor((2 * stats1.hp + stats2.hp) / 3),
      atk: Math.floor((stats1.atk + 2 * stats2.atk) / 3),
      def: Math.floor((stats1.def + 2 * stats2.def) / 3),
      spatk: Math.floor((2 * stats1.spatk + stats2.spatk) / 3),
      spdef: Math.floor((2 * stats1.spdef + stats2.spdef) / 3),
      spe: Math.floor((stats1.spe + 2 * stats2.spe) / 3)
    }

    stats.base = Object.values(stats).reduce((sum, stat) => sum + stat, 0)

    return stats
  },
  fuseTypes (types1, types2) {
    const pickWithPriority = types => types
      .filter((type, index, types) => types.indexOf(type) === index)
      .slice(0, 2)

    return types2.length === 1
      ? pickWithPriority([types1[0], types2[0]])
      : pickWithPriority([types1[0], types2[1], types2[0]])
  },
  fuseAbilities (abilities1, abilities2) {
    const abilities = [
      abilities2[0].ability,
      (abilities1[1]?.isHidden ?? true)
        ? abilities1[0].ability
        : abilities1[1].ability
    ]

    const hiddenAbilities = [...Array(3)]
      .flatMap((_, index) => [
        abilities1[index]?.ability,
        abilities2[index]?.ability
      ])
      .filter(ability => ability)
      .filter(ability => !abilities.includes(ability))

    return {
      abilities: [...new Set(abilities)],
      hiddenAbilities: [...new Set(hiddenAbilities)]
    }
  },
}