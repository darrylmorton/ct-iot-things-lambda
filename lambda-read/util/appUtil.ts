import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'
import { uuidValidateV4 } from '../../test/helper/thingHelper'

const DB_TABLE_NAME_PREFIX = 'ct-iot'
const THINGS_DB_TABLE_NAME_SUFFIX = 'things'

export const getThingsDbName = () => {
  const NODE_ENV = process.env.NODE_ENV

  switch (NODE_ENV) {
    case 'production':
      return `${DB_TABLE_NAME_PREFIX}-${NODE_ENV}-${THINGS_DB_TABLE_NAME_SUFFIX}`
    case 'test':
      process.env.AWS_REGION = 'eu-west-2'
      return `${DB_TABLE_NAME_PREFIX}-${NODE_ENV}-${THINGS_DB_TABLE_NAME_SUFFIX}`
    default:
      return `${DB_TABLE_NAME_PREFIX}-development-${THINGS_DB_TABLE_NAME_SUFFIX}`
  }
}

const getDbClient = async (): Promise<DynamoDBClient> => {
  if (process.env.NODE_ENV === 'test') {
    return new DynamoDBClient({
      region: 'localhost',
      credentials: {
        accessKeyId: 'wt20ei',
        secretAccessKey: '9t246v',
      },
      tls: false,
      endpoint: 'http://localhost:8000',
    })
  } else {
    return new DynamoDBClient({})
  }
}

export const getDbDocumentClient = async (): Promise<DynamoDBDocumentClient> => {
  const marshallOptions = {
    // Whether to automatically convert empty strings, blobs, and sets to `null`.
    convertEmptyValues: false, // false, by default.
    // Whether to remove undefined values while marshalling.
    removeUndefinedValues: true, // false, by default.
    // Whether to convert typeof object to map attribute.
    convertClassInstanceToMap: false, // false, by default.
  }

  const unmarshallOptions = {
    // Whether to return numbers as a string instead of converting them to native JavaScript numbers.
    wrapNumbers: false, // false, by default.
  }

  const translateConfig = { marshallOptions, unmarshallOptions }

  // @ts-ignore
  return DynamoDBDocumentClient.from(await getDbClient(), translateConfig)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const consoleErrorOutput = (value: string | unknown, err: any | unknown) => {
  if (process.env.NODE_ENV !== 'test') {
    // eslint-disable-next-line no-console
    console.error(`${value} db write error`, err)
  }
}

export const getPathId = () => {
  const path = '/thing/id'
  const paths = path.split('/')

  if (paths.length === 1 && paths[0] === 'thing' && uuidValidateV4(paths[1])) {
    paths.splice(0, 1)

    return paths[1]
  } else {
    return 0
  }
}
