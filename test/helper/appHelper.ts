/* eslint-disable @typescript-eslint/no-explicit-any */

import { DynamoDBDocumentClient, PutCommand, PutCommandInput, PutCommandOutput } from '@aws-sdk/lib-dynamodb'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { v4 as uuidv4 } from 'uuid'

import { createEvent, DB_NAME } from './thingHelper'
import { Thing } from '../../types'
import { consoleErrorOutput, createCurrentTime } from '../../lambda-create/util/appUtil'

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

  // @ts-ignore
  return DynamoDBDocumentClient.from(await getDbClient(), translateConfig)
}

export const createContext = (functionName: string) => {
  return {
    awsRequestId: '',
    callbackWaitsForEmptyEventLoop: false,
    functionName,
    functionVersion: '',
    invokedFunctionArn: '',
    logGroupName: '',
    logStreamName: '',
    memoryLimitInMB: '',
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
    done(error?: Error, result?: any): void {},
    // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
    fail(error: Error | string): void {},
    getRemainingTimeInMillis(): number {
      return 0
    },
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
    succeed(message: any, object?: any): void {},
  }
}

const pathParametersToPath = (pathParameters: Record<string, string>): string => {
  let path = ''

  if (pathParameters) {
    for (const pathParametersKey in pathParameters) {
      path += `/${pathParameters[pathParametersKey]}`
    }
  } else {
    path = '/'
  }

  return path
}

export const createEventWrapper = (body: string | null, httpMethod: string, pathParameters: Record<string, string>) => {
  const path = pathParametersToPath(pathParameters)

  return createEvent(
    body,
    { 'content-type': 'application/json' },
    httpMethod,
    path,
    {},
    {},
    pathParameters,
    {},
    {
      apiId: '',
      authorizer: undefined,
      httpMethod: '',
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
      path,
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

export const createThing = async (client: DynamoDBDocumentClient, thingName: string, thingType: string) => {
  const currentDate: string = createCurrentTime()

  const thing: Thing = {
    id: uuidv4(),
    thingName,
    thingType,
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

    return { statusCode: result.$metadata.httpStatusCode, message: 'ok', body: thing }
  } catch (err: any | unknown) {
    consoleErrorOutput('create-thing-test-lambda', err)

    return { statusCode: err.$metadata?.httpStatusCode, message: 'error' }
  }
}
