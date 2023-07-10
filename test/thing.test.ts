/* eslint-disable @typescript-eslint/no-explicit-any */

import { describe, it, before, after } from 'mocha'
import * as sinon from 'sinon'
import { assert } from 'chai'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'
import { v4 as uuidv4 } from 'uuid'
import { Context } from 'aws-lambda'

import * as createThingLambda from '../lambda-create/index'
import * as readThingLambda from '../lambda-read/index'
import { createContext, createThing, createEventWrapper, getDbDocumentClient } from './helper/appHelper'
import {
  assertThingResponse,
  assertResponseError,
  createTable,
  dropTable,
  assertThingsResponse,
} from './helper/thingHelper'
import { ThingResponse } from '../types'
import { API_GATEWAY_HEADERS } from '../lambda-create/util/appUtil'

describe('thing tests', () => {
  let client: DynamoDBDocumentClient
  let context: Context

  let thingZeroId: string, thingOneId: string
  let thingZeroName: string, thingOneName: string, thingTwoName: string
  let deviceZeroId: string, deviceOneId: string, deviceTwoId: string
  let thingTypeZeroId: string, thingTypeOneId: string, thingTypeTwoId: string

  before(async () => {
    deviceZeroId = 'esp-aaaaaa000000'
    deviceOneId = 'esp-bbbbbb111111'
    deviceTwoId = 'esp-abcdef123456'

    thingZeroName = 'thingZero'
    thingOneName = 'thingOne'
    thingTwoName = 'thingTwo'

    thingTypeZeroId = uuidv4()
    thingTypeOneId = uuidv4()
    thingTypeTwoId = uuidv4()
  })

  before(async () => {
    client = await getDbDocumentClient()
    await createTable(client)

    const { body: createdThingBody } = await createThing(client, thingOneName, deviceOneId, thingTypeOneId)
    thingOneId = createdThingBody?.id || ''

    context = createContext('read-thing-test-lambda')
  })

  after(async () => {
    await dropTable(client)
  })

  describe('read things', () => {
    it('read things', async () => {
      const body = JSON.stringify([
        {
          id: thingOneId,
          thingName: thingOneName,
          deviceId: deviceOneId,
          thingTypeId: thingTypeOneId,
          description: thingOneName,
        },
      ])
      const expectedResult: ThingResponse = {
        headers: API_GATEWAY_HEADERS,
        statusCode: 200,
        body,
      }

      const event = createEventWrapper(null, 'GET', {})

      const lambdaSpy: sinon.SinonSpy = sinon.spy(
        // @ts-ignore
        readThingLambda.handler
      )
      const lambdaSpyResult = await lambdaSpy(event, context)

      assert(lambdaSpy.withArgs(event, context).calledOnce)
      assertThingsResponse(lambdaSpyResult, expectedResult)
    })

    it('read thing by id', async () => {
      const qsParams = { id: 'ABC' }

      const event = createEventWrapper(null, 'GET', qsParams)

      const lambdaSpy: sinon.SinonSpy = sinon.spy(
        // @ts-ignore
        readThingLambda.handler
      )
      const lambdaSpyResult = await lambdaSpy(event, context)

      assert(lambdaSpy.withArgs(event, context).calledOnce)
      assertResponseError(lambdaSpyResult, API_GATEWAY_HEADERS, 400)
    })

    it('read thing by id', async () => {
      const qsParams = { id: thingOneId }
      const body = JSON.stringify([
        {
          id: thingOneId,
          thingName: thingOneName,
          deviceId: deviceOneId,
          thingTypeId: thingTypeOneId,
          description: thingOneName,
        },
      ])
      const expectedResult: ThingResponse = {
        headers: API_GATEWAY_HEADERS,
        statusCode: 200,
        body,
      }

      const event = createEventWrapper(null, 'GET', qsParams)

      const lambdaSpy: sinon.SinonSpy = sinon.spy(
        // @ts-ignore
        readThingLambda.handler
      )
      const lambdaSpyResult = await lambdaSpy(event, context)

      assert(lambdaSpy.withArgs(event, context).calledOnce)
      assertThingsResponse(lambdaSpyResult, expectedResult)
    })

    it('read missing thing by id', async () => {
      const qsParams = { id: thingZeroId }

      const event = createEventWrapper(null, 'GET', qsParams)

      const lambdaSpy: sinon.SinonSpy = sinon.spy(
        // @ts-ignore
        readThingLambda.handler
      )
      const lambdaSpyResult = await lambdaSpy(event, context)

      assert(lambdaSpy.withArgs(event, context).calledOnce)
      assertResponseError(lambdaSpyResult, API_GATEWAY_HEADERS, 400)
    })

    it('read thing by name', async () => {
      const qsParams = { thingName: thingOneName }
      const body = JSON.stringify([
        {
          id: thingOneId,
          thingName: thingOneName,
          deviceId: deviceOneId,
          thingTypeId: thingTypeOneId,
          description: thingOneName,
        },
      ])
      const expectedResult: ThingResponse = {
        headers: API_GATEWAY_HEADERS,
        statusCode: 200,
        body,
      }

      const event = createEventWrapper(null, 'GET', qsParams)

      const lambdaSpy: sinon.SinonSpy = sinon.spy(
        // @ts-ignore
        readThingLambda.handler
      )
      const lambdaSpyResult = await lambdaSpy(event, context)

      assert(lambdaSpy.withArgs(event, context).calledOnce)
      assertThingsResponse(lambdaSpyResult, expectedResult)
    })

    it('read missing thing by name', async () => {
      const qsParams = { thingName: thingZeroName }

      const event = createEventWrapper(null, 'GET', qsParams)

      const lambdaSpy: sinon.SinonSpy = sinon.spy(
        // @ts-ignore
        readThingLambda.handler
      )
      const lambdaSpyResult = await lambdaSpy(event, context)

      assert(lambdaSpy.withArgs(event, context).calledOnce)
      assertResponseError(lambdaSpyResult, API_GATEWAY_HEADERS, 404)
    })

    it('read thing by device id', async () => {
      const qsParams = { deviceId: deviceOneId }
      const body = JSON.stringify([
        {
          id: thingOneId,
          thingName: thingOneName,
          deviceId: deviceOneId,
          thingTypeId: thingTypeOneId,
          description: thingOneName,
        },
      ])
      const expectedResult: ThingResponse = {
        headers: API_GATEWAY_HEADERS,
        statusCode: 200,
        body,
      }

      const event = createEventWrapper(null, 'GET', qsParams)

      const lambdaSpy: sinon.SinonSpy = sinon.spy(
        // @ts-ignore
        readThingLambda.handler
      )
      const lambdaSpyResult = await lambdaSpy(event, context)

      assert(lambdaSpy.withArgs(event, context).calledOnce)
      assertThingsResponse(lambdaSpyResult, expectedResult)
    })

    it('read missing thing by device id', async () => {
      const qsParams = { deviceId: deviceZeroId }

      const event = createEventWrapper(null, 'GET', qsParams)

      const lambdaSpy: sinon.SinonSpy = sinon.spy(
        // @ts-ignore
        readThingLambda.handler
      )
      const lambdaSpyResult = await lambdaSpy(event, context)

      assert(lambdaSpy.withArgs(event, context).calledOnce)
      assertResponseError(lambdaSpyResult, API_GATEWAY_HEADERS, 404)
    })

    it('read thing by type', async () => {
      const qsParams = { thingTypeId: 'ABC' }

      const event = createEventWrapper(null, 'GET', qsParams)

      const lambdaSpy: sinon.SinonSpy = sinon.spy(
        // @ts-ignore
        readThingLambda.handler
      )
      const lambdaSpyResult = await lambdaSpy(event, context)

      assert(lambdaSpy.withArgs(event, context).calledOnce)
      assertResponseError(lambdaSpyResult, API_GATEWAY_HEADERS, 400)
    })

    it('read thing by type', async () => {
      const qsParams = { thingTypeId: thingTypeOneId }
      const body = JSON.stringify([
        {
          id: thingOneId,
          thingName: thingOneName,
          deviceId: deviceOneId,
          thingTypeId: thingTypeOneId,
          description: thingOneName,
        },
      ])
      const expectedResult: ThingResponse = {
        headers: API_GATEWAY_HEADERS,
        statusCode: 200,
        body,
      }

      const event = createEventWrapper(null, 'GET', qsParams)

      const lambdaSpy: sinon.SinonSpy = sinon.spy(
        // @ts-ignore
        readThingLambda.handler
      )
      const lambdaSpyResult = await lambdaSpy(event, context)

      assert(lambdaSpy.withArgs(event, context).calledOnce)
      assertThingsResponse(lambdaSpyResult, expectedResult)
    })

    it('read missing thing by type', async () => {
      const qsParams = { thingTypeId: thingTypeZeroId }

      const event = createEventWrapper(null, 'GET', qsParams)

      const lambdaSpy: sinon.SinonSpy = sinon.spy(
        // @ts-ignore
        readThingLambda.handler
      )
      const lambdaSpyResult = await lambdaSpy(event, context)

      assert(lambdaSpy.withArgs(event, context).calledOnce)
      assertResponseError(lambdaSpyResult, API_GATEWAY_HEADERS, 404)
    })
  })

  describe('create things', () => {
    it('create bad thing', async () => {
      const body = JSON.stringify({ thingName: '', deviceId: '', thingTypeId: '', description: '' })

      const event = createEventWrapper(body, 'POST', {})

      const lambdaSpy: sinon.SinonSpy = sinon.spy(
        // @ts-ignore
        createThingLambda.handler
      )
      const lambdaSpyResult = await lambdaSpy(event, context)

      assert(lambdaSpy.withArgs(event, context).calledOnce)
      assertResponseError(lambdaSpyResult, API_GATEWAY_HEADERS, 400)
    })

    it('create thing', async () => {
      const body = JSON.stringify({
        thingName: thingTwoName,
        deviceId: deviceTwoId,
        thingTypeId: thingTypeTwoId,
        description: thingTwoName,
      })
      const expectedResult: ThingResponse = {
        headers: API_GATEWAY_HEADERS,
        statusCode: 200,
        body,
      }

      const event = createEventWrapper(body, 'POST', {})

      const lambdaSpy: sinon.SinonSpy = sinon.spy(
        // @ts-ignore
        createThingLambda.handler
      )
      const lambdaSpyResult = await lambdaSpy(event, context)

      assert(lambdaSpy.withArgs(event, context).calledOnce)
      assertThingResponse(lambdaSpyResult, expectedResult)
    })

    it('create existing thing', async () => {
      const body = JSON.stringify({
        thingName: thingTwoName,
        deviceId: deviceTwoId,
        thingTypeId: thingTypeTwoId,
        description: thingTwoName,
      })

      const event = createEventWrapper(body, 'POST', {})

      const lambdaSpy: sinon.SinonSpy = sinon.spy(
        // @ts-ignore
        createThingLambda.handler
      )
      const lambdaSpyResult = await lambdaSpy(event, context)

      assert(lambdaSpy.withArgs(event, context).calledOnce)
      assertResponseError(lambdaSpyResult, API_GATEWAY_HEADERS, 409)
    })

    it('create existing thing', async () => {
      const body = JSON.stringify({
        thingName: thingZeroName,
        deviceId: deviceTwoId,
        thingTypeId: thingTypeTwoId,
        description: thingTwoName,
      })

      const event = createEventWrapper(body, 'POST', {})

      const lambdaSpy: sinon.SinonSpy = sinon.spy(
        // @ts-ignore
        createThingLambda.handler
      )
      const lambdaSpyResult = await lambdaSpy(event, context)

      assert(lambdaSpy.withArgs(event, context).calledOnce)
      assertResponseError(lambdaSpyResult, API_GATEWAY_HEADERS, 409)
    })
  })
})
