import { CreateTableCommand, DeleteTableCommand, DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { expect } from 'chai'
import { validate as uuidValidate, version as uuidVersion } from 'uuid'

import { SimpleThing, ThingResponse } from '../../types'

const uuidValidateV4 = (uuid: string) => {
  return uuidValidate(uuid) && uuidVersion(uuid) === 4
}

export const getThingsDbName = () => {
  process.env.AWS_REGION = 'eu-west-2'
  return 'ct-iot-test-things'
}

export const createThingsTable = async (dbClient: DynamoDBClient) => {
  const input = {
    TableName: getThingsDbName(),
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
      {
        AttributeName: 'updatedAt',
        KeyType: 'RANGE',
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

export const dropThingsTable = async (dbClient: DynamoDBClient) => {
  const params = {
    TableName: getThingsDbName(),
  }

  const command = new DeleteTableCommand(params)

  await dbClient.send(command)
}

export const createThingEvent = (
  thingName: string,
  thingType: string,
  description: string,
  currentDate: string
): SimpleThing => {
  return {
    thingName,
    thingType,
    description,
    updatedAt: currentDate,
    createdAt: currentDate,
  }
}

export const assertThingResponse = (actualResult: ThingResponse, expectedResult: ThingResponse) => {
  expect(actualResult.statusCode).to.equal(200)
  expect(actualResult.message).to.equal('ok')

  expect(actualResult.result).to.have.length(1)
  expect(uuidValidateV4(actualResult.result[0].id)).to.deep.equal(true)
  expect(actualResult.result[0].thingName).to.equal(expectedResult.result[0].thingName)
  expect(actualResult.result[0].thingType).to.equal(expectedResult.result[0].thingType)
  expect(actualResult.result[0].description).to.equal(expectedResult.result[0].description)
  // expect(dayjs(actualResult.result[0].createdAt).isValid()).to.be.true
  // expect(dayjs(actualResult.result[0].updatedAt).isValid()).to.be.true
}

export const assertThingResponseError = (actualResult: ThingResponse) => {
  expect(actualResult.statusCode).to.equal(200)
  expect(actualResult.message).to.equal('ok')
}
