import { CreateTableCommand, DeleteTableCommand, DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { expect } from 'chai'
import { validate as uuidValidate, version as uuidVersion } from 'uuid'
import { APIGatewayEventDefaultAuthorizerContext, APIGatewayEventRequestContextWithAuthorizer } from 'aws-lambda'
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

export const uuidValidateV4 = (uuid: string) => {
  return uuidValidate(uuid) && uuidVersion(uuid) === 4
}

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
        AttributeName: 'thingType',
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
        IndexName: 'thingTypeIndex',
        KeySchema: [
          {
            AttributeName: 'thingType',
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
  requestContext: APIGatewayEventRequestContextWithAuthorizer<APIGatewayEventDefaultAuthorizerContext>,
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
  expect(actualResult.message).to.equal(expectedResult.message)

  const actualResultBody: ResponseBody = JSON.parse(actualResult.body)
  const expectedResultBody: ResponseBody = JSON.parse(actualResult.body)

  expect(uuidValidateV4(actualResultBody.id)).to.deep.equal(true)
  expect(actualResultBody.thingName).to.equal(expectedResultBody.thingName)
  expect(actualResultBody.thingType).to.equal(expectedResultBody.thingType)
  expect(actualResultBody.description).to.equal(expectedResultBody.description)
}

export const assertResponseError = (actualResult: ResponseError, statusCode: number, message: string) => {
  expect(actualResult.statusCode).to.equal(statusCode)
  expect(actualResult.message).to.equal(message)
}
