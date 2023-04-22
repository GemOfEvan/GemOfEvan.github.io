Vue.component('fusion-pokemon', {
  props: {
    fusionPokemon: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      statNames: [
        {
          key: 'hp',
          label: 'HP'
        },
        {
          key: 'atk',
          label: 'Attack'
        },
        {
          key: 'def',
          label: 'Defense'
        },
        {
          key: 'spatk',
          label: 'Sp. Atk'
        },
        {
          key: 'spdef',
          label: 'Sp. Def'
        },
        {
          key: 'spe',
          label: 'Speed'
        },
        {
          key: 'base',
          label: 'Total'
        }
      ]
    }
  },
  computed: {
    typeEffectivenesses () {
      const defenseMap = typesDefensesMap[this.fusionPokemon.types[0]]

      if (this.fusionPokemon.types[1]) {
        Object.keys(defenseMap).forEach(attackingType => {
          defenseMap[attackingType] *= typesDefensesMap[this.fusionPokemon.types[1]][attackingType]
        })
      }

      return Object.entries(defenseMap)
        .reduce((effectivenessMap, [type, effectiveness]) => {
          effectivenessMap[effectiveness] = [
            ...effectivenessMap[effectiveness] ?? [],
            type
          ]

          return effectivenessMap
        }, {})
    }
  },
  template: `
    <q-card 
      class="q-pa-md"
      style="width: 400px;">
      <div class="text-center q-mb-md">
        <span class="text-caption">
          #{{ fusionPokemon.dexNumber }}: 
        </span>
        <span class="text-h6">
          {{ fusionPokemon.pokemonData1.name }}/{{ fusionPokemon.pokemonData2.name }}
        </span>
        <span class="text-caption">
          ({{ fusionPokemon.id }})
         </span>
      </div>

      <div class="row no-wrap q-mb-md items-center">
        <div class="q-mr-lg">
          <div class="relative-position">
            <img
              :src="fusionPokemon.imageUrl"
              style="width: 150px; height: 150px; border-radius: 8px; background: lightGray;" />

            <q-icon
              v-if="fusionPokemon.hasCustomArt"
              class="absolute-top-right q-ma-xs bg-white"
              style="border-radius: 100%;"
              color="yellow-10"
              size="sm"
              name="star">
              <q-tooltip>
                Custom Sprite
              </q-tooltip>
            </q-icon>
          </div>
          <div class="row no-wrap q-gutter-x-sm justify-center">
            <img
              v-for="type in fusionPokemon.types"
              :key="type"
              style="width: 65px;"
              :src="'./types/' + type + '.png'" />
          </div>
        </div>

        <div class="col">
          <table class="full-width">
            <tr
              v-for="statName in statNames"
              :key="statName.key"
              :class="statName.key === 'base' ? 'text-weight-medium' : ''">
              <td>
                {{ statName.label }}
              </td>
              <td class="text-right">
                {{ fusionPokemon.statsAndDeltas[statName.key].stat }}
              </td>
              <td 
                class="text-right"
                :style="{
                  color: fusionPokemon.statsAndDeltas[statName.key].delta === 0 
                    ? 'orange'
                    : fusionPokemon.statsAndDeltas[statName.key].delta > 0 ? 'green' : 'red'
                }">
                ({{ fusionPokemon.statsAndDeltas[statName.key].delta >= 0 ? '+' : '' }}{{ fusionPokemon.statsAndDeltas[statName.key].delta }})
              </td>
            </tr>
          </table>
        </div>
      </div>

      <div>
        <div>
          Abilities: 
          <template v-for="(ability, index) in fusionPokemon.abilities"><template v-if="index > 0">, </template><span 
            class="text-weight-medium"
            :key="ability">{{ ability }}</span></template>
        </div>
        <div>
          Hidden:
          <template v-for="(ability, index) in fusionPokemon.hiddenAbilities"><template v-if="index > 0">, </template><span 
            class="text-weight-medium"
            :key="ability">{{ ability }}</span></template>
        </div>
      </div>
    </q-card>
  `
})