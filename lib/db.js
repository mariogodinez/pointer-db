'use strict'
const r = require('rethinkdb')
const co = require('co')
const Promise = require('bluebird')

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

    let setup = co.wrap(function * () {
      let conn = yield connection
      let dbList = yield r.dbList().run(conn)

      if (dbList.indexOf(db) === -1) {
        yield r.dbCreate(db).run(conn)
      }

      let dbTables = yield r.db(db).tableList().run(conn)
      if (dbTables.indexOf('images') === -1) {
        r.db(db).tableCreate('images').run(conn)
      }

      if (dbTables.indexOf('users') === -1) {
        r.db(db).tableCreate('users').run(conn)
      }
      return conn
    })
    return Promise.resolve(setup()).asCallback(callback)
  }
}

// se exporta la clase constructora
module.exports = Db
