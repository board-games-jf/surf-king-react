// Verify the exact owner-approved binary assets, not visually similar replacements.
const fs = require('node:fs')
const path = require('node:path')
const crypto = require('node:crypto')
const assert = require('node:assert/strict')
const approved = {
    "sunburn": "2c0eb998f7952f3fef984925460ce59662b42169",
    "bigwave": "e49e8741e63a534c5f21f944cb6a9b36e19889c9",
    "tsunami": "4cea8f953cdafb5fd86407766548167cf6116661",
    "amulet": "5b726e336785e84bd768e33dabad6e9510ca6433",
    "stone": "ae9725e934b61eb7a091a9aab5968b9e271b7050",
    "storm": "0e5decea7ffd6b97e53b18a7c97e56dfe0cce2c0",
    "cyclone": "2967186211da9c7831b35fc56243abdd137cd448",
    "island": "da897bedb56b8d8356910f35136706f7703eb258",
    "energyx2": "ad8a2cacafbf689e079f6a82ef4eaf35fd15ebd1",
    "lifeguardfloat": "323106fead35f8d8eab505fd4138f6a9d0d13885",
    "jumping": "2a560086ffc424d360d8163241cd14bde3d3541b",
    "surfcurrent": "5132288ec9cee73e3a823344de5010f1005d7245",
    "change": "4a1f89942e8db19f68cb399abc1be915fad43c4e",
    "hangloose": "3a30b1ae8289943b2eb6bf11028c9d14179a3030",
    "shark": "4e153b2cfd9ee6e0dc94f30dcef62c756c2af197",
    "cardback": "df869e98c874632a9cc0815f7e5e61dd35a84ace"
}
for (const [name, expected] of Object.entries(approved)) {
    const data = fs.readFileSync(path.join(__dirname, '../src/assets/cards/r1', name + '.webp'))
    assert.equal(data.subarray(0, 4).toString(), 'RIFF', name)
    assert.equal(data.subarray(8, 12).toString(), 'WEBP', name)
    const actual = crypto.createHash('sha1').update('blob ' + data.length + '\0').update(data).digest('hex')
    assert.equal(actual, expected, name + ' must match the approved artwork')
}
console.log('Verified ' + Object.keys(approved).length + ' approved WebP assets.')
