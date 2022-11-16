import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

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

export const getDbClient = async (): Promise<DynamoDBClient> => {
  if (process.env.NODE_ENV === 'test') {
    return new DynamoDBClient({
      region: 'eu-west-2',
      credentials: {
        secretAccessKey: 'KEY',
        accessKeyId: 'ACCESSKEY',
      },
      tls: false,
      endpoint: 'http://localhost:8000',
    })
  } else {
    return new DynamoDBClient({})
  }
}
