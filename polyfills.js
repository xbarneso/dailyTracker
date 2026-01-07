// Polyfill for Object.fromEntries (Node.js 10 compatibility)
if (typeof Object.fromEntries === 'undefined') {
  Object.fromEntries = function(entries) {
    if (!entries || !entries[Symbol.iterator]) {
      throw new Error('Object.fromEntries requires an iterable argument')
    }
    const obj = {}
    for (const pair of entries) {
      if (Object(pair) !== pair) {
        throw new Error('Iterator value is not an entry object')
      }
      obj[pair[0]] = pair[1]
    }
    return obj
  }
}
