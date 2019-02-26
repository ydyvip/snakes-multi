function clone(obj) { // Deep copy by value instead of reference

  if (!(obj === Object(obj))) return obj // Check if the object belongs to a primitive data type

  if (obj instanceof Node) return obj.cloneNode(true) // Clone DOM trees

  let _obj // The clone of obj

  switch (obj.constructor) {
    default:
    case Object:
      _obj = Object.create(Object.getPrototypeOf(obj)) // Assign [[Prototype]] for inheritance

      for (let key of Reflect.ownKeys(obj)) {
        obj[key] === obj // Handle infinite recursive references (or circular structures)
        ? _obj[key] = _obj
        : _obj[key] = clone(obj[key])
      }
      break

    case Array:
      _obj = obj.map(i => Array.isArray(i) ? clone(i) : i)
      break

    case Date:
      _obj = new Date(+obj)
      break

    case Function:
      _obj = new Function("return " + String(obj))()
      Object.defineProperties(_obj, Object.getOwnPropertyDescriptors(obj))
      break
  }

  return _obj
}

module.exports = clone;
