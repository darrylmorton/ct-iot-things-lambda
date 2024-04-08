/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars */

import { DynamoDBDocumentClient, PutCommand, PutCommandInput, PutCommandOutput } from '@aws-sdk/lib-dynamodb'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { v4 as uuidv4 } from 'uuid'
import { Context } from 'aws-lambda'

import { createEvent, DB_NAME } from './thingHelper'
import { Thing, ThingResponse } from '../../types'
import { API_GATEWAY_HEADERS, consoleErrorOutput } from '../../lambda-create/util/appUtil'
import { APIGatewayProxyEvent } from 'aws-lambda/trigger/api-gateway-proxy'

export const getDbClient = async (): Promise<DynamoDBClient> => {
  if (process.env.NODE_ENV === 'test') {
    return new DynamoDBClient({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: `${process.env.AWS_ACCESS_KEY_ID}`,
        secretAccessKey: `${process.env.AWS_SECRET_ACCESS_KEY}`,
      },
      tls: false,
      endpoint: 'http://localhost:8000',
    })
  } else {
    return new DynamoDBClient({})
  }
}

export const getDbDocumentClient = async (): Promise<DynamoDBDocumentClient> => {
  const marshallOptions = {
    // Whether to automatically convert empty strings, blobs, and sets to `null`.
    convertEmptyValues: false, // false, by default.
    // Whether to remove undefined values while marshalling.
    removeUndefinedValues: true, // false, by default.
    // Whether to convert typeof object to map attribute.
    convertClassInstanceToMap: false, // false, by default.
  }

  const unmarshallOptions = {
    // Whether to return numbers as a string instead of converting them to native JavaScript numbers.
    wrapNumbers: false, // false, by default.
  }

  const translateConfig = { marshallOptions, unmarshallOptions }

  return DynamoDBDocumentClient.from(await getDbClient(), translateConfig)
}

export const createContext = (functionName: string): Context => {
  return {
    callbackWaitsForEmptyEventLoop: false,
    functionName,
    functionVersion: 'mocked',
    invokedFunctionArn: 'mocked',
    memoryLimitInMB: 'mocked',
    awsRequestId: 'mocked',
    logGroupName: 'mocked',
    logStreamName: 'mocked',
    getRemainingTimeInMillis(): number {
      return 999
    },
    done(error?: Error, result?: any) {
      console.error(error)
    },
    fail(error: Error | string) {
      console.error(error)
    },
    succeed(messageOrObject: any) {},
  }
}

export const createEventWrapper = (
  body: string | null,
  httpMethod: string,
  qsParams: Record<string, string>
): APIGatewayProxyEvent => {
  return createEvent(
    body,
    { 'content-type': 'application/json' },
    httpMethod,
    '/thing',
    {},
    {},
    {},
    qsParams,
    {
      httpMethod,
      apiId: '',
      authorizer: undefined,
      http: {
        method: httpMethod,
        path: '/thing',
        protocol: 'HTTP/1.1',
        sourceIp: '111.11.11.11',
        userAgent:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36',
      },
      identity: {
        accessKey: null,
        accountId: null,
        apiKey: null,
        apiKeyId: null,
        caller: null,
        clientCert: null,
        cognitoAuthenticationProvider: null,
        cognitoAuthenticationType: null,
        cognitoIdentityId: null,
        cognitoIdentityPoolId: null,
        principalOrgId: null,
        sourceIp: '',
        user: null,
        userAgent: null,
        userArn: null,
      },
      path: '/thing',
      protocol: '',
      requestId: '',
      requestTimeEpoch: 0,
      resourceId: '',
      resourcePath: '',
      stage: '',
      accountId: '',
    },
    '',
    {}
  )
}

export const createThing = async (
  client: DynamoDBDocumentClient,
  thingName: string,
  deviceId: string,
  thingTypeId: string
): Promise<ThingResponse> => {
  const currentDate: string = new Date().toISOString()

  const thing: Thing = {
    id: uuidv4(),
    thingName,
    deviceId,
    thingTypeId,
    description: thingName,
    updatedAt: currentDate,
    createdAt: currentDate,
  }

  const params: PutCommandInput = {
    TableName: DB_NAME,
    Item: thing,
  }

  try {
    const result: PutCommandOutput = await client.send(new PutCommand(params))

    return { headers: API_GATEWAY_HEADERS, statusCode: result.$metadata.httpStatusCode, body: JSON.stringify(thing) }
  } catch (err: any) {
    consoleErrorOutput('create-thing-test-lambda', 'createThing', err)

    return { headers: API_GATEWAY_HEADERS, statusCode: err.$metadata?.httpStatusCode, body: '' }
  }
}
