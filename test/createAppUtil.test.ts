import { describe, it, before, after } from 'mocha'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'
import { v4 as uuidv4 } from 'uuid'
import { expect } from 'chai'

import { createThingDb, getDbDocumentClient, createTable, dropTable } from './helper/appHelper'
import { assertResponseError, assertPutThingResult, assertThingWithDates } from './helper/thingHelper'
import { PutThingResult, ResponseError, Thing } from '../types'
import {
  API_GATEWAY_HEADERS,
  createThing,
  getDbName,
  putThing,
  queryByDeviceId,
  queryByThingName,
} from '../lambda-create/util/appUtil'

describe('create thing util tests', () => {
  let client: DynamoDBDocumentClient

  let thingZeroName: string, thingOneName: string
  let deviceZeroId: string, deviceOneId: string
  let thingTypeZeroId: string, thingTypeOneId: string

  before(async () => {
    deviceZeroId = 'esp-aaaaaa000000'
    deviceOneId = 'esp-bbbbbb111111'

    thingZeroName = 'thingZero'
    thingOneName = 'thingOne'

    thingTypeZeroId = uuidv4()
    thingTypeOneId = uuidv4()
  })

  before(async () => {
    client = await getDbDocumentClient()
    await createTable(client)
  })

  after(async () => {
    await dropTable(client)
  })

  describe('query', () => {
    before(async () => {
      await createThingDb(client, thingOneName, deviceOneId, thingTypeOneId)
    })

    it('by thing name', async () => {
      const actualResult: ResponseError = await queryByThingName(client, thingOneName)

      assertResponseError(actualResult, API_GATEWAY_HEADERS, 409)
    })

    it('by thing name - name does not exist', async () => {
      const actualResult: ResponseError = await queryByThingName(client, thingZeroName)

      assertResponseError(actualResult, API_GATEWAY_HEADERS, 404)
    })

    it('by device id', async () => {
      const actualResult: ResponseError = await queryByDeviceId(client, deviceOneId)

      assertResponseError(actualResult, API_GATEWAY_HEADERS, 409)
    })

    it('by device id - device id does not exist', async () => {
      const actualResult: ResponseError = await queryByDeviceId(client, deviceZeroId)

      assertResponseError(actualResult, API_GATEWAY_HEADERS, 404)
    })
  })

  describe('put', () => {
    it('create', async () => {
      const thing = createThing(thingZeroName, deviceZeroId, thingTypeZeroId, thingZeroName)
      const expectedResult = {
        statusCode: 200,
        result: thing,
      }

      const actualResult: PutThingResult = await putThing(client, thing)

      assertPutThingResult(actualResult, expectedResult)
    })
  })

  describe('createThing', () => {
    it('create', async () => {
      const isoDate = new Date().toISOString()

      const expectedResult: Thing = {
        id: uuidv4(),
        thingName: thingZeroName,
        deviceId: deviceZeroId,
        thingTypeId: thingTypeZeroId,
        description: thingZeroName,
        updatedAt: isoDate,
        createdAt: isoDate,
      }

      const actualResult: Thing = createThing(thingZeroName, deviceZeroId, thingTypeZeroId, thingZeroName)

      assertThingWithDates(actualResult, expectedResult)
    })

    it('create with id', async () => {
      const id = uuidv4()
      const isoDate = new Date().toISOString()

      const expectedResult: Thing = {
        id,
        thingName: thingZeroName,
        deviceId: deviceZeroId,
        thingTypeId: thingTypeZeroId,
        description: thingZeroName,
        updatedAt: isoDate,
        createdAt: isoDate,
      }

      const actualResult: Thing = createThing(thingZeroName, deviceZeroId, thingTypeZeroId, thingZeroName, id)

      expect(actualResult.id).to.equal(expectedResult.id)
      assertThingWithDates(actualResult, expectedResult)
    })
  })

  describe('getDbName', () => {
    let environmentName: string

    afterEach(() => {
      process.env.NODE_ENV = 'test'
      process.env.DB_TABLE_NAME = 'ct-iot-test-things'
    })

    it('development', async () => {
      environmentName = 'development'
      process.env.NODE_ENV = environmentName

      const expectedResult = `ct-iot-${environmentName}-things`

      const actualResult = getDbName()

      expect(actualResult).to.equal(expectedResult)
    })

    it('production', async () => {
      environmentName = 'production'
      process.env.NODE_ENV = environmentName
      process.env.DB_TABLE_NAME = `ct-iot-${environmentName}-things`

      const expectedResult = `ct-iot-${environmentName}-things`

      const actualResult = getDbName()

      expect(actualResult).to.equal(expectedResult)
    })

    it('test', async () => {
      const expectedResult = 'ct-iot-test-things'

      const actualResult = getDbName()

      expect(actualResult).to.equal(expectedResult)
    })
  })
})
