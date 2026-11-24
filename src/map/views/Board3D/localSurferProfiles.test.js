import {
  LOCAL_SURFER_PROFILES_KEY, LOCAL_PLAYER_COUNT, normalizeLocalPlayerId, readLastLocalSurferPlayer,
  readLocalSurferProfiles, saveLocalSurferProfile
} from './localSurferProfiles'

function storage() {
  const map = new Map()
  return {
    getItem: key => map.has(key) ? map.get(key) : null,
    setItem: (key, value) => map.set(key, String(value))
  }
}

describe('local player appearance profiles', () => {
  test('accepts exactly seven local player IDs', () => {
    expect(LOCAL_PLAYER_COUNT).toBe(7)
    expect(Array.from({ length: LOCAL_PLAYER_COUNT }, (_, id) => normalizeLocalPlayerId(id)))
      .toEqual(['0', '1', '2', '3', '4', '5', '6'])
    for (const id of [-1, 7, 1.5, '01', 'bad']) {
      expect(normalizeLocalPlayerId(id)).toBeNull()
    }
  })

  test('stores independent minimal appearance choices for each player', () => {
    const store = storage()
    saveLocalSurferProfile(0, { character: 'female', boardType: 'fish', skinTone: 'tan', boardColor: 'pink' }, store)
    saveLocalSurferProfile('4', { character: 'male', boardType: 'longboard' }, store)
    expect(readLastLocalSurferPlayer(store)).toBe('4')
    expect(readLocalSurferProfiles(store)).toEqual({
      '0': { character: 'female', boardType: 'fish' },
      '4': { character: 'male', boardType: 'longboard' }
    })
    expect(JSON.parse(store.getItem(LOCAL_SURFER_PROFILES_KEY)).version).toBe(1)
  })

  test('rejects invalid writes without overwriting previous profile', () => {
    const store = storage()
    saveLocalSurferProfile(1, { character: 'female', boardType: 'shortboard' }, store)
    expect(() => saveLocalSurferProfile(7, { character: 'male', boardType: 'fish' }, store)).toThrow()
    expect(() => saveLocalSurferProfile(1, { character: 'other', boardType: 'fish' }, store)).toThrow()
    expect(readLocalSurferProfiles(store)).toEqual({ '1': { character: 'female', boardType: 'shortboard' } })
  })

  test('ignores corrupt or untrusted saved data, preserves valid profiles', () => {
    const store = storage()
    store.setItem(LOCAL_SURFER_PROFILES_KEY, '{bad JSON')
    expect(readLocalSurferProfiles(store)).toEqual({})
    expect(readLastLocalSurferPlayer(store)).toBe('0')
    store.setItem(LOCAL_SURFER_PROFILES_KEY, JSON.stringify({
      version: 1,
      players: {
        '0': { character: 'male', boardType: 'fish', extra: { energy: 999 } },
        '1': { character: 'female', boardType: 'unknown' },
        '7': { character: 'female', boardType: 'longboard' }
      }
    }))
    expect(readLocalSurferProfiles(store)).toEqual({ '0': { character: 'male', boardType: 'fish' } })
    expect(readLocalSurferProfiles({ getItem: () => { throw new Error('Access denied') } })).toEqual({})
  })
})
