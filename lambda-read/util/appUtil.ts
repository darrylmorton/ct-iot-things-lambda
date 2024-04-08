import {
  AttributeValue,
  DynamoDBClient,
  ScanCommand,
  ScanCommandInput,
  ScanCommandOutput,
} from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, QueryCommand, QueryCommandInput, QueryCommandOutput } from '@aws-sdk/lib-dynamodb'
import { unmarshall } from '@aws-sdk/util-dynamodb'
import { Context } from 'aws-lambda'
import { validate as uuidValidate, version as uuidVersion } from 'uuid'

import { ThingResponse } from '../../types'

const DB_TABLE_NAME_PREFIX = 'ct-iot'
const DB_TABLE_NAME_SUFFIX = 'things'

export const API_GATEWAY_HEADERS = { 'Content-Type': 'application/json' }

export const getDbName = (): string => {
  const NODE_ENV = process.env.NODE_ENV

  switch (NODE_ENV) {
    case 'production':
      return `${process.env.DB_TABLE_NAME}`
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

export const consoleErrorOutput = (lambdaFunctionName: string | unknown, functionName: string, err: unknown): void => {
  if (process.env.NODE_ENV !== 'test') {
    // eslint-disable-next-line no-console
    console.error(`${lambdaFunctionName}: ${functionName} - error`, err)
  }
}

export const uuidValidateV4 = (uuid: string): boolean => {
  return uuidValidate(uuid) && uuidVersion(uuid) === 4
}

export const getItems = async (client: DynamoDBDocumentClient, context?: Context): Promise<ThingResponse> => {
  try {
    const params: ScanCommandInput = {
      TableName: getDbName(),
      Select: 'SPECIFIC_ATTRIBUTES',
      ProjectionExpression: 'id, thingName, deviceId, thingTypeId, description',
    }

    const result: ScanCommandOutput = await client.send(new ScanCommand(params))

    const body = result.Items?.reduce(
      (acc: Array<Record<string, AttributeValue>>, item: Record<string, AttributeValue>) => {
        const unmarshalledItem = unmarshall(item)

        acc.push(unmarshalledItem)

        return acc
      },
      []
    )

    return {
      headers: API_GATEWAY_HEADERS,
      statusCode: result.$metadata.httpStatusCode,
      body: JSON.stringify(body),
    }
  } catch (err) {
    consoleErrorOutput(context?.functionName, 'getItems', err)

    return {
      headers: API_GATEWAY_HEADERS,
      statusCode: 500,
      body: '',
    }
  }
}

export const queryById = async (
  client: DynamoDBDocumentClient,
  id: string,
  context?: Context
): Promise<ThingResponse> => {
  if (!uuidValidateV4(id)) {
    return {
      headers: API_GATEWAY_HEADERS,
      statusCode: 400,
      body: '',
    }
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
      return {
        headers: API_GATEWAY_HEADERS,
        statusCode: 200,
        body: JSON.stringify(result.Items),
      }
    } else {
      return {
        headers: API_GATEWAY_HEADERS,
        statusCode: 404,
        body: '',
      }
    }
  } catch (err) {
    consoleErrorOutput(context?.functionName, 'queryById', err)

    return {
      headers: API_GATEWAY_HEADERS,
      statusCode: 500,
      body: '',
    }
  }
}

export const queryByThingName = async (
  client: DynamoDBDocumentClient,
  thingName: string,
  context?: Context
): Promise<ThingResponse> => {
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
      return {
        headers: API_GATEWAY_HEADERS,
        statusCode: 200,
        body: JSON.stringify(result.Items),
      }
    } else {
      return {
        headers: API_GATEWAY_HEADERS,
        statusCode: 404,
        body: '',
      }
    }
  } catch (err) {
    consoleErrorOutput(context?.functionName, 'queryByThingName', err)

    return {
      headers: API_GATEWAY_HEADERS,
      statusCode: 500,
      body: '',
    }
  }
}

export const queryByDeviceId = async (
  client: DynamoDBDocumentClient,
  deviceId: string,
  context?: Context
): Promise<ThingResponse> => {
  if (!deviceId) {
    return {
      headers: API_GATEWAY_HEADERS,
      statusCode: 400,
      body: '',
    }
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
      return {
        headers: API_GATEWAY_HEADERS,
        statusCode: 200,
        body: JSON.stringify(result.Items),
      }
    } else {
      return {
        headers: API_GATEWAY_HEADERS,
        statusCode: 404,
        body: '',
      }
    }
  } catch (err) {
    consoleErrorOutput(context?.functionName, 'queryByDeviceId', err)

    return {
      headers: API_GATEWAY_HEADERS,
      statusCode: 500,
      body: '',
    }
  }
}

export const queryByThingTypeId = async (
  client: DynamoDBDocumentClient,
  thingTypeId: string,
  context?: Context
): Promise<ThingResponse> => {
  if (!uuidValidateV4(thingTypeId)) {
    return {
      headers: API_GATEWAY_HEADERS,
      statusCode: 400,
      body: '',
    }
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
      return {
        headers: API_GATEWAY_HEADERS,
        statusCode: 200,
        body: JSON.stringify(result.Items),
      }
    } else {
      return {
        headers: API_GATEWAY_HEADERS,
        statusCode: 404,
        body: '',
      }
    }
  } catch (err) {
    consoleErrorOutput(context?.functionName, 'queryByThingName', err)

    return {
      headers: API_GATEWAY_HEADERS,
      statusCode: 500,
      body: '',
    }
  }
}
