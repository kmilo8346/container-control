import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parsePaintingOutput } from '../src/hooks/painting-output.ts'

const row = '\u001b[38;2;100;120;140m▄'

test('renders artwork when the start marker is missing from Railway logs', () => {
  assert.deepEqual(parsePaintingOutput(['Starting Container', row, row, 'PAINTING_END']), {
    lines: [row, row],
    complete: true,
  })
})

test('renders partial artwork while waiting for the end marker', () => {
  assert.deepEqual(parsePaintingOutput([row]), { lines: [row], complete: false })
})

test('does not report an empty painting as complete', () => {
  assert.deepEqual(parsePaintingOutput(['PAINTING_END']), { lines: [], complete: false })
})

test('filters container messages inside framed artwork', () => {
  assert.deepEqual(
    parsePaintingOutput(['PAINTING_START', row, 'Starting Container', 'PAINTING_END']),
    {
      lines: [row],
      complete: true,
    },
  )
})

test('rejects a mismatched legacy painting marker', () => {
  assert.throws(() => parsePaintingOutput(['PAINTING_START:other', row], 'mona-lisa'))
})
