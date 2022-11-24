import { APIGatewayProxyEvent, Context } from 'aws-lambda'
import { GetItemCommand, GetItemCommandInput } from '@aws-sdk/client-dynamodb'
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb'

import { consoleErrorOutput, getDbDocumentClient, getThingsDbName } from './util/appUtil'

exports.handler = async function run(event: APIGatewayProxyEvent, context?: Context) {
  if (event.pathParameters?.id) {
    const params: GetItemCommandInput = {
      TableName: getThingsDbName(),
      Key: marshall({ id: event.pathParameters.id }),
      AttributesToGet: ['id', 'thingName', 'thingType', 'description'],
    }

    try {
      // @ts-ignore
      const result: GetItemCommandOutput = await (await getDbDocumentClient()).send(new GetItemCommand(params))

      if (result.Item) {
        const body = unmarshall(result.Item)

        return { statusCode: result.$metadata.httpStatusCode, message: 'ok', body: JSON.stringify(body) }
      } else {
        return { statusCode: 404, message: 'missing item' }
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any | unknown) {
      consoleErrorOutput(context?.functionName, err)

      return { statusCode: err.$metadata?.httpStatusCode, message: 'error' }
    }
  } else {
    return { statusCode: 404, message: 'missing item' }
  }
}
