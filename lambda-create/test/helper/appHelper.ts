import {
  CreateTableCommand,
  DeleteTableCommand,
  DynamoDBClient,
  QueryCommand,
  QueryCommandInput,
} from '@aws-sdk/client-dynamodb'

import { getThingsDbName } from '../../util/appUtil'

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

export const findThingsById = async (client: DynamoDBClient, id: string) => {
  try {
    const params: QueryCommandInput = {
      TableName: getThingsDbName(),
      ExpressionAttributeValues: {
        ':id': {
          S: id,
        },
      },
      KeyConditionExpression: 'id = :id',
    }

    return client.send(new QueryCommand(params))
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('query err', err)
    return null
  }
}

export const findThingsByName = async (client: DynamoDBClient, thingName: string) => {
  try {
    const params: QueryCommandInput = {
      TableName: getThingsDbName(),
      IndexName: 'thingNameIndex',
      ExpressionAttributeValues: {
        ':thingName': {
          S: thingName,
        },
      },
      KeyConditionExpression: 'thingName = :thingName',
    }

    return client.send(new QueryCommand(params))
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('query err', err)
    return null
  }
}

export const findThingsByThingType = async (client: DynamoDBClient, thingType: string) => {
  try {
    const params: QueryCommandInput = {
      TableName: getThingsDbName(),
      IndexName: 'thingTypeIndex',
      ExpressionAttributeValues: {
        ':thingType': {
          S: thingType,
        },
      },
      KeyConditionExpression: 'thingType = :thingType',
    }

    return client.send(new QueryCommand(params))
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('query err', err)
    return null
  }
}

export const createContext = () => {
  return {
    awsRequestId: '',
    callbackWaitsForEmptyEventLoop: false,
    functionName: 'create-things-test-lambda',
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

export const createEvent = (thingName: string, thingType: string, description: string, currentDate: string) => {
  return {
    thingName,
    thingType,
    description,
    updatedAt: currentDate,
    createdAt: currentDate,
  }
}

export const delay = (time: number) => {
  return new Promise((resolve) => setTimeout(resolve, time))
}
