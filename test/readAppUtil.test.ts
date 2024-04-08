import { describe, it, before, after } from 'mocha'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'
import { v4 as uuidv4 } from 'uuid'
import { expect } from 'chai'

import { createThingDb, getDbDocumentClient, createTable, dropTable } from './helper/appHelper'
import { assertResponseError } from './helper/thingHelper'
import { ResponseError, Thing } from '../types'

import {
  API_GATEWAY_HEADERS,
  getDbName,
  getItems,
  queryByDeviceId,
  queryById,
  queryByThingName,
  queryByThingTypeId,
} from '../lambda-read/util/appUtil'

describe('read thing util tests', () => {
  let client: DynamoDBDocumentClient

  let thingZeroId: string, thingOneId: string
  let thingZeroName: string, thingOneName: string
  let deviceZeroId: string, deviceOneId: string
  let thingTypeZeroId: string, thingTypeOneId: string

  before(async () => {
    thingZeroId = uuidv4()
    thingOneId = uuidv4()

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

    const { body: createdThingBody } = await createThingDb(
      client,
      thingOneName,
      deviceOneId,
      thingTypeOneId,
      thingOneId
    )
    const thingBodyParsed: Thing = JSON.parse(createdThingBody)
    thingOneId = thingBodyParsed.id
  })

  after(async () => {
    await dropTable(client)
  })

  describe('read', () => {
    it('all', async () => {
      const actualResult: ResponseError = await getItems(client)

      assertResponseError(actualResult, API_GATEWAY_HEADERS, 200)
    })

    it('by id - invalid uuid', async () => {
      const actualResult: ResponseError = await queryById(client, '0')

      assertResponseError(actualResult, API_GATEWAY_HEADERS, 400)
    })

    it('by id - thing does not exist', async () => {
      const actualResult: ResponseError = await queryById(client, thingZeroId)

      assertResponseError(actualResult, API_GATEWAY_HEADERS, 404)
    })

    it('by id', async () => {
      const actualResult: ResponseError = await queryById(client, thingOneId)

      assertResponseError(actualResult, API_GATEWAY_HEADERS, 200)
    })

    it('by thing name - thing does not exist', async () => {
      const actualResult: ResponseError = await queryByThingName(client, thingZeroName)

      assertResponseError(actualResult, API_GATEWAY_HEADERS, 404)
    })

    it('by thing name', async () => {
      const actualResult: ResponseError = await queryByThingName(client, thingOneName)

      assertResponseError(actualResult, API_GATEWAY_HEADERS, 200)
    })

    it('by device id - thing does not exist', async () => {
      const actualResult: ResponseError = await queryByDeviceId(client, deviceZeroId)

      assertResponseError(actualResult, API_GATEWAY_HEADERS, 404)
    })

    it('by device id', async () => {
      const actualResult: ResponseError = await queryByDeviceId(client, deviceOneId)

      assertResponseError(actualResult, API_GATEWAY_HEADERS, 200)
    })

    it('by thing type id - invalid uuid', async () => {
      const actualResult: ResponseError = await queryByThingTypeId(client, '0')

      assertResponseError(actualResult, API_GATEWAY_HEADERS, 400)
    })

    it('by thing type id - thing type does not exist', async () => {
      const actualResult: ResponseError = await queryByThingTypeId(client, thingTypeZeroId)

      assertResponseError(actualResult, API_GATEWAY_HEADERS, 404)
    })

    it('by thing type id', async () => {
      const actualResult: ResponseError = await queryByThingTypeId(client, thingTypeOneId)

      assertResponseError(actualResult, API_GATEWAY_HEADERS, 200)
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
