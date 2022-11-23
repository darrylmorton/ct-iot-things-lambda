import { uuidValidateV4 } from './thingHelper'
// @ts-ignore
function getPaths() {
  const path = '/thing/id'
  const paths = path.split('/')

  if (paths.length == 1 && paths[0] === 'thing' && uuidValidateV4(paths[1])) {
    paths.splice(0, 1)

    return paths[1]
  } else {
    return 0
  }

  console.log(paths)
}

getPaths()
