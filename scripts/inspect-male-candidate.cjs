// Inspect the downloaded review candidate without executing any external code.
const fs = require('fs')
const crypto = require('crypto')
const assert = require('node:assert/strict')
const filename = process.argv[2]
const data = fs.readFileSync(filename)
assert.ok(data.length < 40 * 1024 * 1024)
assert.equal(data.subarray(0,4).toString(), 'glTF')
assert.equal(data.readUInt32LE(4),2)
assert.equal(data.readUInt32LE(8),data.length)
assert.equal(data.subarray(16,20).toString(), 'JSON')
const gltf = JSON.parse(data.subarray(20,20+data.readUInt32LE(12)).toString())
const joints = [...new Set((gltf.skins || []).flatMap(skin=>skin.joints.map(i=>gltf.nodes[i].name)))]
const required = ['Hips', ...['Left','Right'].flatMap(side=>['UpLeg','Leg','Foot','Arm','ForeArm','Hand'].map(j=>side+j))]
const info = { source: 'https://grab3d.com/dl/man-base-character-rigged/man-base-character-rigged.glb', bytes:data.length, sha256:crypto.createHash('sha256').update(data).digest('hex'), joints, clips:(gltf.animations||[]).map(clip=>clip.name), triangles:(gltf.meshes||[]).flatMap(m=>m.primitives).reduce((n,p)=>n+Math.floor(gltf.accessors[p.indices ?? p.attributes.POSITION].count/3),0), embedded: (gltf.buffers||[]).every(b=>!b.uri)&&(gltf.images||[]).every(i=>!i.uri), missingJoints: required.filter(n=>!joints.includes(n)) }
console.log(JSON.stringify(info,null,2))
fs.writeFileSync(filename + '.json',JSON.stringify(info,null,2))
assert.ok(info.embedded,'External resources are not permitted')
assert.ok(gltf.skins?.length && gltf.meshes.some(m=>m.primitives.some(p=>p.attributes.JOINTS_0!==undefined)),'A skinned mesh is required')
assert.deepEqual(info.missingJoints,[],'Rig needs anatomical joint mapping')
