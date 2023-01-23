import { APIGatewayProxyEvent, Context } from 'aws-lambda'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'

import {
  getDbDocumentClient,
  getItems,
  queryById,
  queryByThingName,
  queryByDeviceId,
  queryByThingTypeId,
} from './util/appUtil'
import { ResponseError, ThingResponse } from '../types'

export const handler = async function run(
  event: APIGatewayProxyEvent,
  context: Context
): Promise<ThingResponse | ResponseError> {
  const client: DynamoDBDocumentClient = await getDbDocumentClient()

  if (!event.queryStringParameters || Object.keys(event.queryStringParameters).length === 0) {
    return getItems(client, context)
  } else if (event.queryStringParameters?.id) {
    return queryById(client, event.queryStringParameters.id, context)
  } else if (event.queryStringParameters?.thingName) {
    return queryByThingName(client, event.queryStringParameters.thingName, context)
  } else if (event.queryStringParameters?.deviceId) {
    return queryByDeviceId(client, event.queryStringParameters.deviceId, context)
  } else if (event.queryStringParameters?.thingTypeId) {
    return queryByThingTypeId(client, event.queryStringParameters.thingTypeId, context)
  }

  return {
    headers: { 'Content-Type': 'application/json' },
    statusCode: 400,
  }
}
