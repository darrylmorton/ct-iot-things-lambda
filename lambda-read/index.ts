import { APIGatewayProxyEvent, Context } from 'aws-lambda'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'

import { getDbDocumentClient, getItemById, getItems, queryByThingName, queryByThingType } from './util/appUtil'
import { ResponseError, ThingResponse } from '../types'

exports.handler = async function run(
  event: APIGatewayProxyEvent,
  context: Context
): Promise<ThingResponse | ResponseError> {
  if (event.httpMethod.toUpperCase() === 'GET') {
    const client: DynamoDBDocumentClient = await getDbDocumentClient()

    if (!event.queryStringParameters || Object.keys(event.queryStringParameters).length === 0) {
      return getItems(client, context)
    } else if (event.queryStringParameters?.id) {
      return getItemById(client, event.queryStringParameters.id, context)
    } else if (event.queryStringParameters?.thingName) {
      return queryByThingName(client, event.queryStringParameters.thingName, context)
    } else if (event.queryStringParameters?.thingType) {
      return queryByThingType(client, event.queryStringParameters.thingType, context)
    }

    return { statusCode: 404, message: 'missing thing(s)' }
  }

  return { statusCode: 400, message: 'invalid request' }
}
