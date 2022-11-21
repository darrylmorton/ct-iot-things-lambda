import * as dayjs from 'dayjs'
import * as utc from 'dayjs/plugin/utc'
import * as timezone from 'dayjs/plugin/timezone'
import { GetItemCommandInput } from '@aws-sdk/client-dynamodb'
import { QueryCommand } from '@aws-sdk/lib-dynamodb'
import { Context } from 'aws-lambda'

import { getDbDocumentClient, getThingsDbName } from './util/appUtil'

// @ts-ignore
dayjs.extend(utc)
// @ts-ignore
dayjs.extend(timezone)

exports.handler = async function run(event: any, context?: Context) {
  const params = {
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
    // @ts-ignore
  } catch (err: GetItemCommandInput) {
    // eslint-disable-next-line no-console
    console.error(`${context?.functionName} db write error`, err)

    return { statusCode: err.$metadata?.httpStatusCode, message: 'error' }
  }
}
