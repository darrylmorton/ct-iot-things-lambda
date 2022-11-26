import { APIGatewayProxyEvent, Context } from 'aws-lambda'
import { GetItemCommandInput } from '@aws-sdk/client-dynamodb'
import { marshall } from '@aws-sdk/util-dynamodb'

import { getDbDocumentClient, getDbName, getItemById } from './util/appUtil'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'

exports.handler = async function run(event: APIGatewayProxyEvent, context: Context) {
  if (event.pathParameters?.id) {
    const client: DynamoDBDocumentClient = await getDbDocumentClient()
    const params: GetItemCommandInput = {
      TableName: getDbName(),
      Key: marshall({ id: event.pathParameters.id }),
      AttributesToGet: ['id', 'thingName', 'thingType', 'description'],
    }

    return getItemById(client, params, context)
  } else {
    return { statusCode: 404, message: 'missing thing' }
  }
}
