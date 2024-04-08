/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars */

import { DynamoDBDocumentClient, PutCommand, PutCommandInput, PutCommandOutput } from '@aws-sdk/lib-dynamodb'
import {
  AttributeValue,
  CreateTableCommand,
  CreateTableCommandInput,
  CreateTableCommandOutput,
  DeleteTableCommand,
  DeleteTableCommandOutput,
  DynamoDBClient,
  ScanCommandOutput,
} from '@aws-sdk/client-dynamodb'
import { v4 as uuidv4 } from 'uuid'
import { Context } from 'aws-lambda'
import {
  APIGatewayProxyEvent,
  APIGatewayProxyEventHeaders,
  APIGatewayProxyEventMultiValueHeaders,
  APIGatewayProxyEventMultiValueQueryStringParameters,
  APIGatewayProxyEventPathParameters,
  APIGatewayProxyEventQueryStringParameters,
  APIGatewayProxyEventStageVariables,
} from 'aws-lambda/trigger/api-gateway-proxy'

import { Thing, ThingResponse } from '../../types'
import { API_GATEWAY_HEADERS, consoleErrorOutput, createThing } from '../../lambda-create/util/appUtil'

export const DB_NAME = 'ct-iot-test-things'

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

export const createThingDb = async (
  client: DynamoDBDocumentClient,
  thingName: string,
  deviceId: string,
  thingTypeId: string,
  id: string = uuidv4()
): Promise<ThingResponse> => {
  const thing: Thing = createThing(thingName, deviceId, thingTypeId, thingName, id)

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

export const createTable = async (dbClient: DynamoDBDocumentClient): Promise<CreateTableCommandOutput> => {
  const input: CreateTableCommandInput = {
    TableName: DB_NAME,
    AttributeDefinitions: [
      {
        AttributeName: 'id',
        AttributeType: 'S',
      },
      {
        AttributeName: 'thingName',
        AttributeType: 'S',
      },
      {
        AttributeName: 'deviceId',
        AttributeType: 'S',
      },
      {
        AttributeName: 'thingTypeId',
        AttributeType: 'S',
      },
      {
        AttributeName: 'updatedAt',
        AttributeType: 'S',
      },
    ],
    KeySchema: [
      {
        AttributeName: 'id',
        KeyType: 'HASH',
      },
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 1,
      WriteCapacityUnits: 1,
    },
    StreamSpecification: {
      StreamEnabled: false,
    },
    BillingMode: 'PAY_PER_REQUEST',
    GlobalSecondaryIndexes: [
      {
        IndexName: 'thingNameIndex',
        KeySchema: [
          {
            AttributeName: 'thingName',
            KeyType: 'HASH',
          },
          {
            AttributeName: 'updatedAt',
            KeyType: 'RANGE',
          },
        ],
        Projection: {
          ProjectionType: 'ALL',
        },
        ProvisionedThroughput: {
          ReadCapacityUnits: 1,
          WriteCapacityUnits: 1,
        },
      },
      {
        IndexName: 'deviceIdIndex',
        KeySchema: [
          {
            AttributeName: 'deviceId',
            KeyType: 'HASH',
          },
          {
            AttributeName: 'updatedAt',
            KeyType: 'RANGE',
          },
        ],
        Projection: {
          ProjectionType: 'ALL',
        },
        ProvisionedThroughput: {
          ReadCapacityUnits: 1,
          WriteCapacityUnits: 1,
        },
      },
      {
        IndexName: 'thingTypeIdIndex',
        KeySchema: [
          {
            AttributeName: 'thingTypeId',
            KeyType: 'HASH',
          },
          {
            AttributeName: 'updatedAt',
            KeyType: 'RANGE',
          },
        ],
        Projection: {
          ProjectionType: 'ALL',
        },
        ProvisionedThroughput: {
          ReadCapacityUnits: 1,
          WriteCapacityUnits: 1,
        },
      },
    ],
  }

  const command = new CreateTableCommand(input)

  return dbClient.send(command)
}

export const dropTable = async (dbClient: DynamoDBDocumentClient): Promise<DeleteTableCommandOutput> => {
  const params = {
    TableName: DB_NAME,
  }

  const command = new DeleteTableCommand(params)

  return dbClient.send(command)
}

export const createEvent = (
  body: string | null,
  headers: APIGatewayProxyEventHeaders,
  httpMethod: string,
  path: string,
  multiValueHeaders: APIGatewayProxyEventMultiValueHeaders,
  multiValueQueryStringParameters: APIGatewayProxyEventMultiValueQueryStringParameters,
  pathParameters: APIGatewayProxyEventPathParameters,
  queryStringParameters: APIGatewayProxyEventQueryStringParameters,
  requestContext: {
    resourceId: string
    authorizer: undefined
    resourcePath: string
    httpMethod: string
    path: string
    accountId: string
    protocol: string
    stage: string
    requestTimeEpoch: number
    identity: {
      cognitoIdentityPoolId: null
      clientCert: null
      cognitoIdentityId: null
      apiKey: null
      principalOrgId: null
      cognitoAuthenticationType: null
      userArn: null
      apiKeyId: null
      userAgent: null
      accountId: null
      caller: null
      sourceIp: string
      accessKey: null
      cognitoAuthenticationProvider: null
      user: null
    }
    requestId: string
    // prettier-ignore
    http: { path: string, protocol: string, method: string, sourceIp: string, userAgent: string }
    apiId: string
  },
  resource: string,
  stageVariables: APIGatewayProxyEventStageVariables
): APIGatewayProxyEvent => {
  return {
    body,
    headers,
    httpMethod,
    isBase64Encoded: false,
    multiValueHeaders,
    multiValueQueryStringParameters,
    path,
    pathParameters,
    queryStringParameters,
    requestContext,
    resource,
    stageVariables,
  }
}

export const createScanCommandOutput = (
  statusCode: number,
  count: number,
  items: Array<Record<string, AttributeValue>> = [],
  scannedCount: number = 0
): ScanCommandOutput => {
  return {
    $metadata: {
      httpStatusCode: statusCode,
      requestId: '7a50b5e8-e91f-4ecb-882f-56e718a9e8d8',
      extendedRequestId: undefined,
      cfId: undefined,
      attempts: 1,
      totalRetryDelay: 0,
    },
    Count: count,
    Items: items,
    ScannedCount: scannedCount,
  }
}
