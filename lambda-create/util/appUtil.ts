import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, QueryCommand, QueryCommandInput, QueryCommandOutput } from '@aws-sdk/lib-dynamodb'

import { ResponseError } from '../../types'

const DB_TABLE_NAME_PREFIX = 'ct-iot'
const DB_TABLE_NAME_SUFFIX = 'things'

export const API_GATEWAY_HEADERS = { 'Content-Type': 'application/json' }

export const getDbName = () => {
  const NODE_ENV = process.env.NODE_ENV

  switch (NODE_ENV) {
    case 'production':
      return process.env.DB_TABLE_NAME
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

  return DynamoDBDocumentClient.from(await getDbClient(), translateConfig)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const consoleErrorOutput = (lambdaFunctionName: string | unknown, functionName: string, err: any | unknown) => {
  if (process.env.NODE_ENV !== 'test') {
    // eslint-disable-next-line no-console
    console.error(`${lambdaFunctionName}: ${functionName} - error`, err)
  }
}

export const queryByThingName = async (client: DynamoDBDocumentClient, thingName: string): Promise<ResponseError> => {
  const params: QueryCommandInput = {
    TableName: getDbName(),
    IndexName: 'thingNameIndex',
    KeyConditionExpression: 'thingName = :thingName',
    ExpressionAttributeValues: { ':thingName': thingName },
    Select: 'SPECIFIC_ATTRIBUTES',
    ProjectionExpression: 'id, thingName, deviceId, thingTypeId, description',
  }

  const result: QueryCommandOutput = await client.send(new QueryCommand(params))

  if (result.Items?.length) {
    return {
      headers: API_GATEWAY_HEADERS,
      statusCode: 409,
    }
  } else {
    return {
      headers: API_GATEWAY_HEADERS,
      statusCode: 404,
    }
  }
}

export const queryByDeviceId = async (client: DynamoDBDocumentClient, deviceId: string): Promise<ResponseError> => {
  const params: QueryCommandInput = {
    TableName: getDbName(),
    IndexName: 'deviceIdIndex',
    KeyConditionExpression: 'deviceId = :deviceId',
    ExpressionAttributeValues: { ':deviceId': deviceId },
    Select: 'SPECIFIC_ATTRIBUTES',
    ProjectionExpression: 'id, thingName, deviceId, thingTypeId, description',
  }

  const result: QueryCommandOutput = await client.send(new QueryCommand(params))

  if (result.Items?.length) {
    return {
      headers: API_GATEWAY_HEADERS,
      statusCode: 409,
    }
  } else {
    return {
      headers: API_GATEWAY_HEADERS,
      statusCode: 404,
    }
  }
}
