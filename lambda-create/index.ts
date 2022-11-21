import { v4 as uuidv4 } from 'uuid'
import * as dayjs from 'dayjs'
import * as utc from 'dayjs/plugin/utc'
import * as timezone from 'dayjs/plugin/timezone'
import { PutItemCommand, PutItemCommandInput, PutItemCommandOutput } from '@aws-sdk/client-dynamodb'
import { marshall } from '@aws-sdk/util-dynamodb'
import { Context } from 'aws-lambda'

import { SimpleThing, Thing } from './types'
import { getDbClient, getThingsDbName } from './util/appUtil'

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

  const params: PutItemCommandInput = {
    TableName: getThingsDbName(),
    Item: marshall(thing),
    ReturnValues: 'NONE',
  }

  try {
    const result: PutItemCommandOutput = await (await getDbClient()).send(new PutItemCommand(params))

    return { statusCode: result.$metadata.httpStatusCode, message: 'ok' }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(`${context?.functionName} db write error`, err)
    return { statusCode: 500, message: 'error' }
  }
}
