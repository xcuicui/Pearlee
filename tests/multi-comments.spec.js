/* eslint-disable no-console */
const assert = require('assert')

const { encodeCursor, decodeCursor } = require('../cloudfunctions/comment_list/_shared/cursor')

function testCursorRoundtrip() {
  const c = encodeCursor(1710000000000, 'abc')
  const d = decodeCursor(c)
  assert.ok(d)
  assert.strictEqual(d.createdAt, 1710000000000)
  assert.strictEqual(d.id, 'abc')
}

function testCursorInvalid() {
  assert.strictEqual(decodeCursor(''), null)
  assert.strictEqual(decodeCursor('not-base64'), null)
}

function run() {
  testCursorRoundtrip()
  testCursorInvalid()
  console.log('OK: multi-comments cursor tests')
}

run()
