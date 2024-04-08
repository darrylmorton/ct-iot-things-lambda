import { describe, it, before, after } from 'mocha'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'
import { v4 as uuidv4 } from 'uuid'

import { createThingDb, getDbDocumentClient, createTable, dropTable } from './helper/appHelper'
import { assertResponseError, assertPutThingResult } from './helper/thingHelper'
import { PutThingResult, ResponseError } from '../types'
import {
  API_GATEWAY_HEADERS,
  createThing,
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
})
