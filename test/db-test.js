'use strict'

const test = require('ava')
const Db = require('../')
const uuid = require('uuid-base62')
const r = require('rethinkdb')

const dbName = `platzigram_${uuid.v4()}`
const db = new Db({db: dbName})

test.before('setup database', async t => {
  await db.connect()
  t.true(db.connected, 'should be connected')
})

test.after('disconect database', async t => {
  await db.disconnect()
  t.false(db.connected, 'should be disconnected')
})

test.after.always('cleanup database', async t => {
  let conn = await r.connect({})
  await r.dbDrop(dbName).run(conn)
})

test('save image', async t => {
  t.is(typeof db.saveImage, 'function', 'save image is a function')

  let image = {
    description: 'An #awesome picture with tags #platzi',
    url: `http://platzigram.test/${uuid.v4()}.jpg`,
    likes: 0,
    liked: false,
    user_id: uuid.uuid()
  }
  let created = await db.saveImage(image)

  t.is(created.description, image.description)
  t.is(created.url, image.url)
  t.deepEqual(created.tags, ['awesome', 'platzi'])
  t.is(created.likes, image.likes)
  t.is(created.liked, image.liked)
  t.is(created.user_id, image.user_id)
  t.is(typeof created.id, 'string')
  t.is(created.public_id, uuid.encode(created.id))
  t.truthy(created.createdAt)
})

