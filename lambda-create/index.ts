import { v4 as uuidv4 } from 'uuid'
import * as dayjs from 'dayjs'
import * as utc from 'dayjs/plugin/utc'
import * as timezone from 'dayjs/plugin/timezone'
import { Context } from 'aws-lambda'
import { PutCommand, PutCommandInput, PutCommandOutput } from '@aws-sdk/lib-dynamodb'

import { SimpleThing, Thing } from '../types'
import { consoleErrorOutput, getDbDocumentClient, getThingsDbName } from '../util/appUtil'

// @ts-ignore
dayjs.extend(utc)
// @ts-ignore
dayjs.extend(timezone)

exports.handler = async function run(event: SimpleThing, context?: Context) {
  const currentDate = dayjs.tz(Date.now(), 'Europe/London').format('YYYY-MM-DDThh:mm:ss:SSS')

  const thing: Thing = {
    id: uuidv4(),
    thingName: event.thingName,
    thingType: event.thingType,
    description: event.description,
    updatedAt: currentDate,
    createdAt: currentDate,
  }

  const params: PutCommandInput = {
    TableName: getThingsDbName(),
    Item: thing,
  }

  try {
    const result: PutCommandOutput = await (await getDbDocumentClient()).send(new PutCommand(params))

    return { statusCode: result.$metadata.httpStatusCode, message: 'ok' }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any | unknown) {
    consoleErrorOutput(context?.functionName, err)

    return { statusCode: err.$metadata?.httpStatusCode, message: 'error' }
  }
}
