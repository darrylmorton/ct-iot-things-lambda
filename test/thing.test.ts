/* eslint-disable @typescript-eslint/no-explicit-any */

import { describe, it, before, after } from 'mocha'
import * as sinon from 'sinon'
import { assert } from 'chai'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'
import { v4 as uuidv4 } from 'uuid'

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

describe('thing tests', function () {
  let client: DynamoDBDocumentClient

  let thingName: string
  let thingType: string

  before(async function () {
    client = await getDbDocumentClient()
    thingName = 'thingOne'
    thingType = uuidv4()

    await createTable(client)
  })

  after(async function () {
    await dropTable(client)
  })

  it('read things', async () => {
    const thingTypeTwo = uuidv4()
    const { body: createdThingBody } = await createThing(client, 'thingTwoB', thingTypeTwo)
    const thingId: string = createdThingBody?.id || ''

    const body = JSON.stringify([
      {
        id: thingId,
        thingName: 'thingTwoB',
        thingType: thingTypeTwo,
        description: 'thingTwoB',
      },
    ])
    const expectedResult: ThingResponse = {
      statusCode: 200,
      message: 'ok',
      body,
    }

    const event = createEventWrapper(null, 'GET', {})
    const context = createContext('read-thing-test-lambda')

    const lambdaSpy: sinon.SinonSpy<unknown[], any> = sinon.spy(
      // @ts-ignore
      readThingLambda.handler
    )
    const lambdaSpyResult = await lambdaSpy(event, context)

    assert(lambdaSpy.withArgs(event, context).calledOnce)
    assertThingsResponse(lambdaSpyResult, expectedResult)
  })

  it('create thing', async () => {
    const body = JSON.stringify({ thingName, thingType, description: thingName })
    const expectedResult: ThingResponse = {
      statusCode: 200,
      message: 'ok',
      body,
    }

    const event = createEventWrapper(body, 'POST', {})
    const context = createContext('create-thing-test-lambda')

    const lambdaSpy: sinon.SinonSpy<unknown[], any> = sinon.spy(
      // @ts-ignore
      createThingLambda.handler
    )
    const lambdaSpyResult = await lambdaSpy(event, context)

    assert(lambdaSpy.withArgs(event, context).calledOnce)
    assertThingResponse(lambdaSpyResult, expectedResult)
  })

  it('create existing thing', async () => {
    const body = JSON.stringify({ thingName, thingType, description: thingName })

    const event = createEventWrapper(body, 'POST', {})
    const context = createContext('create-thing-test-lambda')

    const lambdaSpy: sinon.SinonSpy<unknown[], any> = sinon.spy(
      // @ts-ignore
      createThingLambda.handler
    )
    const lambdaSpyResult = await lambdaSpy(event, context)

    assert(lambdaSpy.withArgs(event, context).calledOnce)
    assertResponseError(lambdaSpyResult, 409, 'thing exists')
  })

  it('create bad thing', async () => {
    const body = JSON.stringify({ thingName: 'thingOne', thingType: '', description: '' })

    const event = createEventWrapper(body, 'POST', {})
    const context = createContext('create-thing-test-lambda')

    const lambdaSpy: sinon.SinonSpy<unknown[], any> = sinon.spy(
      // @ts-ignore
      createThingLambda.handler
    )
    const lambdaSpyResult = await lambdaSpy(event, context)

    assert(lambdaSpy.withArgs(event, context).calledOnce)
    assertResponseError(lambdaSpyResult, 400, 'invalid thing')
  })

  it('read thing by id', async () => {
    const thingTypeTwo = uuidv4()
    const { body: createdThingBody } = await createThing(client, 'thingTwo', thingTypeTwo)
    const thingId: string = createdThingBody?.id || ''

    const qsParams = { id: thingId }
    const body = JSON.stringify([
      {
        id: thingId,
        thingName: 'thingTwo',
        thingType: thingTypeTwo,
        description: 'thingTwo',
      },
    ])
    const expectedResult: ThingResponse = {
      statusCode: 200,
      message: 'ok',
      body,
    }

    const event = createEventWrapper(null, 'GET', qsParams)
    const context = createContext('read-thing-test-lambda')

    const lambdaSpy: sinon.SinonSpy<unknown[], any> = sinon.spy(
      // @ts-ignore
      readThingLambda.handler
    )
    const lambdaSpyResult = await lambdaSpy(event, context)

    assert(lambdaSpy.withArgs(event, context).calledOnce)
    assertThingsResponse(lambdaSpyResult, expectedResult)
  })

  it('read missing thing by id', async () => {
    const thingId = '43961f67-fcfe-4515-8b5d-f59ccca6c041'
    const qsParams = { id: thingId }

    const event = createEventWrapper(null, 'GET', qsParams)
    const context = createContext('read-thing-test-lambda')

    const lambdaSpy: sinon.SinonSpy<unknown[], any> = sinon.spy(
      // @ts-ignore
      readThingLambda.handler
    )
    const lambdaSpyResult = await lambdaSpy(event, context)

    assert(lambdaSpy.withArgs(event, context).calledOnce)
    assertResponseError(lambdaSpyResult, 404, 'missing thing')
  })

  it('read thing by name', async () => {
    const thingTypeTwo = uuidv4()
    const { body: createdThingBody } = await createThing(client, 'thingThree', thingTypeTwo)
    const thingId: string = createdThingBody?.id || ''

    const qsParams = { thingName: 'thingThree' }
    const body = JSON.stringify([
      {
        id: thingId,
        thingName: 'thingThree',
        thingType: thingTypeTwo,
        description: 'thingThree',
      },
    ])
    const expectedResult: ThingResponse = {
      statusCode: 200,
      message: 'ok',
      body,
    }

    const event = createEventWrapper(null, 'GET', qsParams)
    const context = createContext('read-thing-test-lambda')

    const lambdaSpy: sinon.SinonSpy<unknown[], any> = sinon.spy(
      // @ts-ignore
      readThingLambda.handler
    )
    const lambdaSpyResult = await lambdaSpy(event, context)

    assert(lambdaSpy.withArgs(event, context).calledOnce)
    assertThingsResponse(lambdaSpyResult, expectedResult)
  })

  it('read missing thing by name', async () => {
    const qsParams = { thingName: 'thingZero' }

    const event = createEventWrapper(null, 'GET', qsParams)
    const context = createContext('read-thing-test-lambda')

    const lambdaSpy: sinon.SinonSpy<unknown[], any> = sinon.spy(
      // @ts-ignore
      readThingLambda.handler
    )
    const lambdaSpyResult = await lambdaSpy(event, context)

    assert(lambdaSpy.withArgs(event, context).calledOnce)
    assertResponseError(lambdaSpyResult, 404, 'missing thing')
  })

  it('read thing by type', async () => {
    const thingTypeTwo = uuidv4()
    const { body: createdThingBody } = await createThing(client, thingName, thingTypeTwo)
    const thingId: string = createdThingBody?.id || ''

    const qsParams = { thingType: thingTypeTwo }
    const body = JSON.stringify([
      {
        id: thingId,
        thingName,
        thingType: thingTypeTwo,
        description: 'thingOne',
      },
    ])
    const expectedResult: ThingResponse = {
      statusCode: 200,
      message: 'ok',
      body,
    }

    const event = createEventWrapper(null, 'GET', qsParams)
    const context = createContext('read-thing-test-lambda')

    const lambdaSpy: sinon.SinonSpy<unknown[], any> = sinon.spy(
      // @ts-ignore
      readThingLambda.handler
    )
    const lambdaSpyResult = await lambdaSpy(event, context)

    assert(lambdaSpy.withArgs(event, context).calledOnce)
    assertThingsResponse(lambdaSpyResult, expectedResult)
  })

  it('read missing thing by type', async () => {
    const qsParams = { thingType: 'thingTypeZero' }

    const event = createEventWrapper(null, 'GET', qsParams)
    const context = createContext('read-thing-test-lambda')

    const lambdaSpy: sinon.SinonSpy<unknown[], any> = sinon.spy(
      // @ts-ignore
      readThingLambda.handler
    )
    const lambdaSpyResult = await lambdaSpy(event, context)

    assert(lambdaSpy.withArgs(event, context).calledOnce)
    assertResponseError(lambdaSpyResult, 404, 'missing thing')
  })
})
