import { v4 as uuidv4 } from 'uuid'
import { APIGatewayProxyEvent, Context } from 'aws-lambda'
import { PutCommand, PutCommandInput, PutCommandOutput } from '@aws-sdk/lib-dynamodb'

import { Thing } from '../types'
import { consoleErrorOutput, createCurrentTime, getDbDocumentClient, getDbName, queryByThingName } from './util/appUtil'

exports.handler = async function run(event: APIGatewayProxyEvent, context: Context) {
  if (event.httpMethod.toUpperCase() === 'POST' && event.body) {
    try {
      const body = JSON.parse(event.body)

      if (body.thingName && body.thingType && body.description) {
        const client = await getDbDocumentClient()

        const { statusCode, message } = await queryByThingName(client, body.thingName)
        if (statusCode === 409) return { statusCode, message }

        const currentDate: string = createCurrentTime()

        const thing: Thing = {
          id: uuidv4(),
          thingName: body.thingName,
          thingType: body.thingType,
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
