import { describe, it, before, after } from 'mocha'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'
import { v4 as uuidv4 } from 'uuid'

import { createThingDb, getDbDocumentClient, createTable, dropTable } from './helper/appHelper'
import { assertResponseError } from './helper/thingHelper'
import { ResponseError, Thing } from '../types'

import {
  API_GATEWAY_HEADERS,
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
      console.log('actualResult', actualResult)

      assertResponseError(actualResult, API_GATEWAY_HEADERS, 400)
    })

    it('by id - thing does not exist', async () => {
      const actualResult: ResponseError = await queryById(client, thingZeroId)
      console.log('actualResult', actualResult)

      assertResponseError(actualResult, API_GATEWAY_HEADERS, 404)
    })

    it('by id', async () => {
      const actualResult: ResponseError = await queryById(client, thingOneId)
      console.log('actualResult', actualResult)

      assertResponseError(actualResult, API_GATEWAY_HEADERS, 200)
    })

    it('by thing name - thing does not exist', async () => {
      const actualResult: ResponseError = await queryByThingName(client, thingZeroName)
      console.log('actualResult', actualResult)

      assertResponseError(actualResult, API_GATEWAY_HEADERS, 404)
    })

    it('by thing name', async () => {
      const actualResult: ResponseError = await queryByThingName(client, thingOneName)
      console.log('actualResult', actualResult)

      assertResponseError(actualResult, API_GATEWAY_HEADERS, 200)
    })

    it('by device id - thing does not exist', async () => {
      const actualResult: ResponseError = await queryByDeviceId(client, deviceZeroId)
      console.log('actualResult', actualResult)

      assertResponseError(actualResult, API_GATEWAY_HEADERS, 404)
    })

    it('by device id', async () => {
      const actualResult: ResponseError = await queryByDeviceId(client, deviceOneId)
      console.log('actualResult', actualResult)

      assertResponseError(actualResult, API_GATEWAY_HEADERS, 200)
    })

    it('by thing type id - invalid uuid', async () => {
      const actualResult: ResponseError = await queryByThingTypeId(client, '0')
      console.log('actualResult', actualResult)

      assertResponseError(actualResult, API_GATEWAY_HEADERS, 400)
    })

    it('by thing type id - thing type does not exist', async () => {
      const actualResult: ResponseError = await queryByThingTypeId(client, thingTypeZeroId)
      console.log('actualResult', actualResult)

      assertResponseError(actualResult, API_GATEWAY_HEADERS, 404)
    })

    it('by thing type id', async () => {
      const actualResult: ResponseError = await queryByThingTypeId(client, thingTypeOneId)
      console.log('actualResult', actualResult)

      assertResponseError(actualResult, API_GATEWAY_HEADERS, 200)
    })
  })
})
