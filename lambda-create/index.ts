import { v4 as uuidv4 } from 'uuid'
import { APIGatewayProxyEvent, Context } from 'aws-lambda'
import { PutCommand, PutCommandInput, PutCommandOutput } from '@aws-sdk/lib-dynamodb'

import { ResponseError, Thing, ThingResponse } from '../types'
import {
  consoleErrorOutput,
  getDbDocumentClient,
  getDbName,
  API_GATEWAY_HEADERS,
  queryByDeviceId,
  queryByThingName,
} from './util/appUtil'

export const handler = async function run(
  event: APIGatewayProxyEvent,
  context: Context
): Promise<ThingResponse | ResponseError> {
  if (event.body) {
    try {
      const body = JSON.parse(event.body)

      if (body.thingName && body.deviceId && body.thingTypeId && body.description) {
        const client = await getDbDocumentClient()

        const { statusCode: queryByThingNameStatusCode } = await queryByThingName(client, body.thingName)
        if (queryByThingNameStatusCode === 409) {
          return {
            headers: API_GATEWAY_HEADERS,
            statusCode: queryByThingNameStatusCode,
          }
        }

        const { statusCode: queryByDeviceIdStatusCode } = await queryByDeviceId(client, body.deviceId)
        if (queryByDeviceIdStatusCode === 409) {
          return {
            headers: API_GATEWAY_HEADERS,
            statusCode: queryByDeviceIdStatusCode,
          }
        }

        const currentDate: string = new Date().toISOString()

        const thing: Thing = {
          id: uuidv4(),
          thingName: body.thingName,
          deviceId: body.deviceId,
          thingTypeId: body.thingTypeId,
          description: body.description,
          updatedAt: currentDate,
          createdAt: currentDate,
        }

        const params: PutCommandInput = {
          TableName: getDbName(),
          Item: thing,
        }

        const result: PutCommandOutput = await client.send(new PutCommand(params))

        return {
          headers: API_GATEWAY_HEADERS,
          statusCode: result.$metadata.httpStatusCode,
          body: JSON.stringify(thing),
        }
      }

      return {
        headers: API_GATEWAY_HEADERS,
        statusCode: 400,
      }
    } catch (err) {
      consoleErrorOutput(context.functionName, 'handler.index', err)

      return {
        headers: API_GATEWAY_HEADERS,
        statusCode: 500,
      }
    }
  }

  return {
    headers: API_GATEWAY_HEADERS,
    statusCode: 400,
  }
}
