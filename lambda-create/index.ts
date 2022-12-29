import { v4 as uuidv4 } from 'uuid'
import { APIGatewayProxyEvent, Context } from 'aws-lambda'
import { PutCommand, PutCommandInput, PutCommandOutput } from '@aws-sdk/lib-dynamodb'

import { Thing } from '../types'
import {
  consoleErrorOutput,
  getDbDocumentClient,
  getDbName,
  LAMBDA_PATH,
  queryByDeviceId,
  queryByThingName,
} from './util/appUtil'

exports.handler = async function run(event: APIGatewayProxyEvent, context: Context) {
  if (
    // @ts-ignore
    event.requestContext.http.path === LAMBDA_PATH &&
    // @ts-ignore
    event.requestContext.http.method.toUpperCase() === 'POST' &&
    event.body
  ) {
    try {
      const body = JSON.parse(event.body)

      if (body.thingName && body.deviceId && body.thingTypeId && body.description) {
        const client = await getDbDocumentClient()

        const { statusCode: queryByThingNameStatusCode, message: queryByThingNameMessage } = await queryByThingName(
          client,
          body.thingName
        )
        if (queryByThingNameStatusCode === 409) {
          return { statusCode: queryByThingNameStatusCode, message: queryByThingNameMessage }
        }

        const { statusCode: queryByDeviceIdStatusCode, message: queryByDeviceIdMessage } = await queryByDeviceId(
          client,
          body.deviceId
        )
        if (queryByDeviceIdStatusCode === 409) {
          return { statusCode: queryByDeviceIdStatusCode, message: queryByDeviceIdMessage }
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

        return { statusCode: result.$metadata.httpStatusCode, message: 'ok', body: JSON.stringify(thing) }
      }

      return { statusCode: 400, message: 'invalid thing' }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any | unknown) {
      consoleErrorOutput(context.functionName, 'handler.index', err)

      return { statusCode: err.$metadata?.httpStatusCode, message: 'error' }
    }
  }

  return { statusCode: 400, message: 'invalid request' }
}
