import { APIGatewayProxyEvent, Context } from 'aws-lambda'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'

import { getDbDocumentClient, getItemById, getItems, queryByThingName, queryByThingType } from './util/appUtil'
import { ResponseError, ThingResponse } from '../types'

exports.handler = async function run(
  event: APIGatewayProxyEvent,
  context: Context
): Promise<ThingResponse | ResponseError> {
  const client: DynamoDBDocumentClient = await getDbDocumentClient()

  if (event.pathParameters?.id) {
    return getItemById(client, event.pathParameters.id, context)
  } else if (event.pathParameters?.thingName) {
    return queryByThingName(client, event.pathParameters.thingName, context)
  } else if (event.pathParameters?.thingType) {
    return queryByThingType(client, event.pathParameters.thingType, context)
  } else if (event.pathParameters?.thing) {
    return getItems(client, event.pathParameters.thing, context)
  } else {
    return { statusCode: 404, message: 'missing thing(s)' }
  }
}
