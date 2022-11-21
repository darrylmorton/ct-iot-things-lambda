import * as dayjs from 'dayjs'
import * as utc from 'dayjs/plugin/utc'
import * as timezone from 'dayjs/plugin/timezone'
import { QueryCommand, QueryCommandInput } from '@aws-sdk/lib-dynamodb'
import { Context } from 'aws-lambda'

import { consoleErrorOutput, getDbDocumentClient, getThingsDbName } from '../util/appUtil'
import { SimpleThing } from '../types'

// @ts-ignore
dayjs.extend(utc)
// @ts-ignore
dayjs.extend(timezone)

exports.handler = async function run(event: SimpleThing, context?: Context) {
  const params: QueryCommandInput = {
    TableName: getThingsDbName(),
    IndexName: 'thingNameIndex',
    ExpressionAttributeValues: {
      ':thingName': event.thingName,
    },
    KeyConditionExpression: 'thingName = :thingName',
  }

  try {
    const result = await (await getDbDocumentClient()).send(new QueryCommand(params))

    return { statusCode: result.$metadata.httpStatusCode, message: 'ok', result: result.Items }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any | unknown) {
    consoleErrorOutput(context?.functionName, err)

    return { statusCode: err.$metadata?.httpStatusCode, message: 'error' }
  }
}
