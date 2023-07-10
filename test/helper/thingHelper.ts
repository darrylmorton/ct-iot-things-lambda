import { CreateTableCommand, DeleteTableCommand, DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { expect } from 'chai'
import {
  APIGatewayProxyEventMultiValueQueryStringParameters,
  APIGatewayProxyEvent,
  APIGatewayProxyEventHeaders,
  APIGatewayProxyEventMultiValueHeaders,
  APIGatewayProxyEventPathParameters,
  APIGatewayProxyEventQueryStringParameters,
  APIGatewayProxyEventStageVariables,
} from 'aws-lambda/trigger/api-gateway-proxy'

import { ThingResponse, ResponseBody, ResponseError } from '../../types'
import { uuidValidateV4 } from '../../lambda-read/util/appUtil'

export const DB_NAME = 'ct-iot-test-things'

export const createTable = async (dbClient: DynamoDBClient) => {
  const input = {
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

export const dropTable = async (dbClient: DynamoDBClient) => {
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
    http: { path: string; protocol: string; method: string; sourceIp: string; userAgent: string }
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

export const assertThingResponse = (actualResult: ThingResponse, expectedResult: ThingResponse) => {
  expect(actualResult.statusCode).to.equal(expectedResult.statusCode)
  expect(actualResult.headers).to.deep.equal(expectedResult.headers)

  const actualResultBody: ResponseBody = JSON.parse(actualResult.body)
  const expectedResultBody: ResponseBody = JSON.parse(expectedResult.body)

  assertThingResponseBody(actualResultBody, expectedResultBody)
}

export const assertThingsResponse = (actualResult: ThingResponse, expectedResult: ThingResponse) => {
  expect(actualResult.statusCode).to.equal(expectedResult.statusCode)
  expect(actualResult.headers).to.deep.equal(expectedResult.headers)

  const actualResultBody: ResponseBody[] = JSON.parse(actualResult.body)
  const expectedResultBody: ResponseBody[] = JSON.parse(expectedResult.body)

  expect(actualResultBody).to.have.length(expectedResultBody.length)

  for (let counter = 0; counter < actualResultBody.length; counter++) {
    assertThingResponseBody(actualResultBody[counter], expectedResultBody[counter])
  }
}

export const assertThingResponseBody = (actualResultBody: ResponseBody, expectedResultBody: ResponseBody) => {
  expect(uuidValidateV4(actualResultBody.id)).to.deep.equal(true)
  expect(actualResultBody.thingName).to.equal(expectedResultBody.thingName)
  expect(actualResultBody.deviceId).to.equal(expectedResultBody.deviceId)
  expect(actualResultBody.thingTypeId).to.equal(expectedResultBody.thingTypeId)
  expect(actualResultBody.description).to.equal(expectedResultBody.description)
}

export const assertResponseError = (
  actualResult: ResponseError,
  headers: Record<string, string>,
  statusCode: number
) => {
  expect(actualResult.headers).to.deep.equal(headers)
  expect(actualResult.statusCode).to.equal(statusCode)
}
