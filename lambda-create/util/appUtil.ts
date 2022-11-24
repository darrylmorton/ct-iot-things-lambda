import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'
import * as dayjs from 'dayjs'
import * as utc from 'dayjs/plugin/utc'
import * as timezone from 'dayjs/plugin/timezone'
// @ts-ignore
dayjs.extend(utc)
// @ts-ignore
dayjs.extend(timezone)

const DB_TABLE_NAME_PREFIX = 'ct-iot'
const THINGS_DB_TABLE_NAME_SUFFIX = 'things'

export const createCurrentTime = (): string => {
  return dayjs.tz(Date.now(), 'Europe/London').format('YYYY-MM-DDThh:mm:ss:SSS')
}

export const getThingsDbName = () => {
  const NODE_ENV = process.env.NODE_ENV

  switch (NODE_ENV) {
    case 'production':
      return `${DB_TABLE_NAME_PREFIX}-${NODE_ENV}-${THINGS_DB_TABLE_NAME_SUFFIX}`
    case 'test':
      return `${DB_TABLE_NAME_PREFIX}-${NODE_ENV}-${THINGS_DB_TABLE_NAME_SUFFIX}`
    default:
      return `${DB_TABLE_NAME_PREFIX}-development-${THINGS_DB_TABLE_NAME_SUFFIX}`
  }
}

const getDbClient = async (): Promise<DynamoDBClient> => {
  if (process.env.NODE_ENV === 'test') {
    return new DynamoDBClient({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: `${process.env.AWS_ACCESS_KEY_ID}`,
        secretAccessKey: `${process.env.AWS_SECRET_ACCESS_KEY}`,
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
