'use strict'
const r = require('rethinkdb')
const co = require('co')
const Promise = require('bluebird')
const uuid = require('uuid-base62')
const utils = require('./utils')

let defaults = {
  host: 'localhost',
  port: 28015,
  db: 'platzigram'
}

// clase constructora de la conexion
class Db {
  constructor (options) {
    options = options || {}
    this.host = options.host || defaults.host
    this.port = options.port || defaults.port
    this.db = options.db || defaults.db
  }
  // function para conectar la db
  connect (callback) {
    // se crea una conexion dentro de la clase
    this.connection = r.connect({
      host: this.host,
      port: this.port
    })

    let connection = this.connection
    let db = this.db

    this.connected = true

    let setup = co.wrap(function * () {
      let conn = yield connection

      let dbList = yield r.dbList().run(conn)
      if (dbList.indexOf(db) === -1) {
        yield r.dbCreate(db).run(conn)
      }

      let dbTables = yield r.db(db).tableList().run(conn)
      if (dbTables.indexOf('images') === -1) {
        yield r.db(db).tableCreate('images').run(conn)
      }

      if (dbTables.indexOf('users') === -1) {
        yield r.db(db).tableCreate('users').run(conn)
      }
      return conn
    })
    return Promise.resolve(setup()).asCallback(callback)
  }

  disconnect (callback) {
    if (!this.connected) {
      return Promise.reject(new Error('not connected')).asCallback(callback)
    }
    this.connected = false

    return Promise.resolve(this.connection).then(conn => { conn.close() })
  }

  saveImage (image, callback) {
    if (!this.connected) {
      return Promise.reject(new Error('not connected')).asCallback(callback)
    }

    let connection = this.connection
    let db = this.db

    let tasks = co.wrap(function * () {
      let conn = yield connection

      image.createdAt = new Date()
      image.tags = utils.extractTags(image.description)

      let result = yield r.db(db).table('images').insert(image).run(conn)

      if (result.errors > 0) {
        return Promise.reject(new Error(result.first_error))
      }

      image.id = result.generated_keys[0]
      yield r.db(db).table('images').get(image.id).update({
        public_id: uuid.encode(image.id)
      }).run(conn)
      let created = yield r.db(db).table('images').get(image.id).run(conn)

      return Promise.resolve(created)
    })

    return Promise.resolve(tasks()).asCallback(callback)
  }
}

// se exporta la clase constructora
module.exports = Db
