const nameMap = Object.fromEntries(nameFix.map((fromName, index) => [fromName.toLowerCase(), nameException[index].toLowerCase()]))

const typeMap = Object.fromEntries([
    ...typeSwap.map(([type1, type2, name]) => [name.toLowerCase(), [type1, type2]]),
    ...typeUni.map(([type, name]) => [name.toLowerCase(), [type]])
])

const statsMap = Object.fromEntries(statsException.map((fromName, index) => [fromName.toLowerCase(), statsFix[index]]))

const abilitiesMap = Object.fromEntries(abilitiesException.map((fromName, index) => [fromName.toLowerCase(), abilitiesFix[index]]))

const selfFusionTypeMap = Object.fromEntries(selfFusionTypeException.map((fromName, index) => [fromName.toLowerCase(), selfFusionTypeFix[index]]))

const typesDefensesMap = Object.fromEntries(typeName.map((defendingType, defendingTypeIndex) => [
    defendingType,
    Object.fromEntries(typeName.map((attackingType, attackingTypeIndex) => [
        attackingType,
        types[attackingTypeIndex][defendingTypeIndex]
    ]))
]))

const pokemon = ids.map(([internalName, id]) => {
    internalName = internalName.toLowerCase()

    const name = nameMap[internalName] ?? internalName

    return {
        name: name.substring(0, 1).toUpperCase() + name.substring(1),
        internalName,
        id,
        types: typeMap[internalName] ?? null,
        stats: statsMap[internalName] ?? null,
        abilities: abilitiesMap[internalName] ?? null,
        shouldSwapAbilities: abilitySwap.some(name => name.toLowerCase() === internalName),
        selfFusionType: selfFusionTypeMap[internalName] ?? null
    }
})