'use strict'

const test = require('ava')
const utils = require('../lib/utils')

// test('this should pass', t => {
//   t.pass()
// })

// test('this should fail', t => {
//   t.fail()
// })

// test('this should support asyn/await', async t => {
//   let p = Promise.resolve(42)
//   let secret = await p
//   t.is(secret, 42)
// })
test('this should extract tags', t => {
  let tags = utils.extractTags('a #picture with #aWESome tags on #platzi al #100')

  t.deepEqual(tags, [
    'picture',
    'awesome',
    'platzi',
    '100'
  ])
  tags = utils.extractTags('a picture with no tags')
  t.deepEqual(tags, [])

  tags = utils.extractTags()

  t.deepEqual(tags, [])
  tags = utils.extractTags(null)
  t.deepEqual(tags, [])
})
