'use strict'

const test = require('ava')

test('this should pass', t => {
  t.pass()
})

test('this should fail', t => {
  t.fail()
})

test('this should support asyn/await', async t => {
  let p = Promise.resolve(42)
  let secret = await p
  t.is(secret, 42)
})

