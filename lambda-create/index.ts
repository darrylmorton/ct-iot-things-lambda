import { APIGatewayProxyEvent, Context } from 'aws-lambda'

import { PutThingResult, ResponseBody, ThingResponse } from '../types'
import {
  consoleErrorOutput,
  getDbDocumentClient,
  API_GATEWAY_HEADERS,
  queryByDeviceId,
  queryByThingName,
  putThing,
} from './util/appUtil'

export const handler = async function run(event: APIGatewayProxyEvent, context: Context): Promise<ThingResponse> {
  if (event.body) {
    try {
      const body: ResponseBody = JSON.parse(event.body)

      if (body.thingName && body.deviceId && body.thingTypeId && body.description) {
        const client = await getDbDocumentClient()

        const { statusCode: queryByThingNameStatusCode } = await queryByThingName(client, body.thingName)
        if (queryByThingNameStatusCode === 409) {
          return {
            headers: API_GATEWAY_HEADERS,
            statusCode: queryByThingNameStatusCode,
            body: '',
          }
        }

        const { statusCode: queryByDeviceIdStatusCode } = await queryByDeviceId(client, body.deviceId)
        if (queryByDeviceIdStatusCode === 409) {
          return {
            headers: API_GATEWAY_HEADERS,
            statusCode: queryByDeviceIdStatusCode,
            body: '',
          }
        }

        const putThingResult: PutThingResult = await putThing(client, body)
        return {
          headers: API_GATEWAY_HEADERS,
          statusCode: putThingResult.statusCode,
          body: JSON.stringify(putThingResult.result),
        }
      }

      return {
        headers: API_GATEWAY_HEADERS,
        statusCode: 400,
        body: '',
      }
    } catch (err) {
      consoleErrorOutput(context.functionName, 'handler.index', err)

      return {
        headers: API_GATEWAY_HEADERS,
        statusCode: 500,
        body: '',
      }
    }
  }

  return {
    headers: API_GATEWAY_HEADERS,
    statusCode: 400,
    body: '',
  }
}
