import { DynamoDBClient, GetItemCommand, GetItemCommandInput, GetItemCommandOutput } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, QueryCommand, QueryCommandInput, QueryCommandOutput } from '@aws-sdk/lib-dynamodb'
import { ResponseError, ThingResponse } from '../../types'
import { unmarshall } from '@aws-sdk/util-dynamodb'
import { Context } from 'aws-lambda'

const DB_TABLE_NAME_PREFIX = 'ct-iot'
const DB_TABLE_NAME_SUFFIX = 'things'

export const getDbName = () => {
  const NODE_ENV = process.env.NODE_ENV

  switch (NODE_ENV) {
    case 'production':
      return `${DB_TABLE_NAME_PREFIX}-${NODE_ENV}-${DB_TABLE_NAME_SUFFIX}`
    case 'test':
      return `${DB_TABLE_NAME_PREFIX}-${NODE_ENV}-${DB_TABLE_NAME_SUFFIX}`
    default:
      return `${DB_TABLE_NAME_PREFIX}-development-${DB_TABLE_NAME_SUFFIX}`
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

export const getItemById = async (
  client: DynamoDBDocumentClient,
  params: GetItemCommandInput,
  context: Context
): Promise<ThingResponse | ResponseError> => {
  try {
    // @ts-ignore
    const result: GetItemCommandOutput = await client.send(new GetItemCommand(params))

    if (result.Item) {
      const body = unmarshall(result.Item)

      return { statusCode: result.$metadata.httpStatusCode, message: 'ok', body: JSON.stringify(body) }
    } else {
      return { statusCode: 404, message: 'missing thing' }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any | unknown) {
    consoleErrorOutput(context.functionName, err)

    return { statusCode: err.$metadata?.httpStatusCode, message: 'error' }
  }
}

export const queryByThingName = async (
  client: DynamoDBDocumentClient,
  thingName: string
): Promise<ThingResponse | ResponseError> => {
  const params: QueryCommandInput = {
    TableName: getDbName(),
    IndexName: 'thingNameIndex',
    KeyConditionExpression: 'thingName = :thingName',
    ExpressionAttributeValues: { ':thingName': thingName },
    Select: 'SPECIFIC_ATTRIBUTES',
    ProjectionExpression: 'id, thingName, thingType, description',
  }

  const result: QueryCommandOutput = await client.send(new QueryCommand(params))

  if (result.Items?.length) {
    return { statusCode: 200, message: 'ok', body: JSON.stringify(result.Items) }
  } else {
    return { statusCode: 404, message: 'thing missing' }
  }
}

export const queryByThingType = async (
  client: DynamoDBDocumentClient,
  thingType: string
): Promise<ThingResponse | ResponseError> => {
  const params: QueryCommandInput = {
    TableName: getDbName(),
    IndexName: 'thingTypeIndex',
    KeyConditionExpression: 'thingType = :thingType',
    ExpressionAttributeValues: { ':thingType': thingType },
    Select: 'SPECIFIC_ATTRIBUTES',
    ProjectionExpression: 'id, thingName, thingType, description',
  }

  const result: QueryCommandOutput = await client.send(new QueryCommand(params))

  if (result.Items?.length) {
    return { statusCode: 200, message: 'ok', body: JSON.stringify(result.Items) }
  } else {
    return { statusCode: 404, message: 'thing missing' }
  }
}
