import { DynamoDBClient, ScanCommand, ScanCommandInput, ScanCommandOutput } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, QueryCommand, QueryCommandInput, QueryCommandOutput } from '@aws-sdk/lib-dynamodb'
import { unmarshall } from '@aws-sdk/util-dynamodb'
import { Context } from 'aws-lambda'

import { ResponseError, ThingResponse } from '../../types'
import { validate as uuidValidate, version as uuidVersion } from 'uuid'

const DB_TABLE_NAME_PREFIX = 'ct-iot'
const DB_TABLE_NAME_SUFFIX = 'things'

export const LAMBDA_PATH = '/thing'

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
export const consoleErrorOutput = (lambdaFunctionName: string | unknown, functionName: string, err: any | unknown) => {
  if (process.env.NODE_ENV !== 'test') {
    // eslint-disable-next-line no-console
    console.error(`${lambdaFunctionName}: ${functionName} - error`, err)
  }
}

export const uuidValidateV4 = (uuid: string) => {
  return uuidValidate(uuid) && uuidVersion(uuid) === 4
}

export const getItems = async (
  client: DynamoDBDocumentClient,
  context: Context
): Promise<ThingResponse | ResponseError> => {
  try {
    const params: ScanCommandInput = {
      TableName: getDbName(),
      Select: 'SPECIFIC_ATTRIBUTES',
      ProjectionExpression: 'id, thingName, deviceId, thingTypeId, description',
    }

    // @ts-ignore
    const result: ScanCommandOutput = await client.send(new ScanCommand(params))

    if (result.Items) {
      const body = result.Items.reduce((acc, item) => {
        const unmarshalledItem = unmarshall(item)
        // @ts-ignore
        acc.push(unmarshalledItem)

        return acc
      }, [])

      return { statusCode: result.$metadata.httpStatusCode, message: 'ok', body: JSON.stringify(body) }
    } else {
      return { statusCode: 200, message: 'ok', body: JSON.stringify([]) }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any | unknown) {
    consoleErrorOutput(context.functionName, 'getItems', err)

    return { statusCode: err.$metadata?.httpStatusCode, message: 'error' }
  }
}

export const queryById = async (
  client: DynamoDBDocumentClient,
  id: string,
  context: Context
): Promise<ThingResponse | ResponseError> => {
  if (!uuidValidateV4(id)) {
    return { statusCode: 400, message: 'invalid uuid' }
  }

  try {
    const params: QueryCommandInput = {
      TableName: getDbName(),
      KeyConditionExpression: 'id = :id',
      ExpressionAttributeValues: { ':id': id },
      Select: 'SPECIFIC_ATTRIBUTES',
      ProjectionExpression: 'id, thingName, deviceId, thingTypeId, description',
    }

    const result: QueryCommandOutput = await client.send(new QueryCommand(params))

    if (result.Items?.length) {
      return { statusCode: 200, message: 'ok', body: JSON.stringify(result.Items) }
    } else {
      return { statusCode: 404, message: 'missing thing' }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any | unknown) {
    consoleErrorOutput(context.functionName, 'queryById', err)

    return { statusCode: err.$metadata?.httpStatusCode, message: 'error' }
  }
}

export const queryByThingName = async (
  client: DynamoDBDocumentClient,
  thingName: string,
  context: Context
): Promise<ThingResponse | ResponseError> => {
  try {
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
      return { statusCode: 200, message: 'ok', body: JSON.stringify(result.Items) }
    } else {
      return { statusCode: 404, message: 'missing thing' }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any | unknown) {
    consoleErrorOutput(context.functionName, 'queryByThingName', err)

    return { statusCode: err.$metadata?.httpStatusCode, message: 'error' }
  }
}

export const queryByDeviceId = async (
  client: DynamoDBDocumentClient,
  deviceId: string,
  context: Context
): Promise<ThingResponse | ResponseError> => {
  if (!deviceId) {
    return { statusCode: 400, message: 'invalid deviceId' }
  }

  try {
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
      return { statusCode: 200, message: 'ok', body: JSON.stringify(result.Items) }
    } else {
      return { statusCode: 404, message: 'missing thing' }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any | unknown) {
    consoleErrorOutput(context.functionName, 'queryByDeviceId', err)

    return { statusCode: err.$metadata?.httpStatusCode, message: 'error' }
  }
}

export const queryByThingTypeId = async (
  client: DynamoDBDocumentClient,
  thingTypeId: string,
  context: Context
): Promise<ThingResponse | ResponseError> => {
  if (!uuidValidateV4(thingTypeId)) {
    return { statusCode: 400, message: 'invalid uuid' }
  }

  try {
    const params: QueryCommandInput = {
      TableName: getDbName(),
      IndexName: 'thingTypeIdIndex',
      KeyConditionExpression: 'thingTypeId = :thingTypeId',
      ExpressionAttributeValues: { ':thingTypeId': thingTypeId },
      Select: 'SPECIFIC_ATTRIBUTES',
      ProjectionExpression: 'id, thingName, deviceId, thingTypeId, description',
    }

    const result: QueryCommandOutput = await client.send(new QueryCommand(params))

    if (result.Items?.length) {
      return { statusCode: 200, message: 'ok', body: JSON.stringify(result.Items) }
    } else {
      return { statusCode: 404, message: 'missing thing' }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any | unknown) {
    consoleErrorOutput(context.functionName, 'queryByThingName', err)

    return { statusCode: err.$metadata?.httpStatusCode, message: 'error' }
  }
}
