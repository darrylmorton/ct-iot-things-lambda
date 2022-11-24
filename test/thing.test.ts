/* eslint-disable @typescript-eslint/no-explicit-any */

import { describe, it, before, after } from 'mocha'
import * as sinon from 'sinon'
import { Context } from 'aws-lambda'
import { assert } from 'chai'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'
import { v4 as uuidv4 } from 'uuid'

import * as createThingLambda from '../lambda-create/index'
import * as readThingLambda from '../lambda-read/index'
import { ThingResponse } from '../types'
import { createContext, createThing, createEventWrapper, getDbDocumentClient } from './helper/appHelper'
import { assertThingResponse, assertResponseError, createTable, dropTable } from './helper/thingHelper'

describe('thing tests', function () {
  let client: DynamoDBDocumentClient
  let context: Context

  let thingName: string
  let thingType: string

  before(async function () {
    client = await getDbDocumentClient()
    context = createContext('create-thing-test-lambda')
    thingName = 'thingOne'
    thingType = uuidv4()

    await createTable(client)
  })

  after(async function () {
    await dropTable(client)
  })

  it('create thing', async () => {
    const pathParameters = { thing: 'thing' }
    const body = JSON.stringify({ id: '', thingName, thingType, description: thingName })
    const expectedResult: ThingResponse = {
      statusCode: 200,
      message: 'ok',
      body,
    }

    const event = createEventWrapper(body, 'POST', pathParameters)

    const lambdaSpy: sinon.SinonSpy<unknown[], any> = sinon.spy(
      // @ts-ignore
      createThingLambda.handler
    )
    const lambdaSpyResult = await lambdaSpy(event, context)

    assert(lambdaSpy.withArgs(event, context).calledOnce)
    assertThingResponse(lambdaSpyResult, expectedResult)
  })

  it('create existing thing', async () => {
    const pathParameters = { thing: 'thing' }
    const body = JSON.stringify({ id: '', thingName, thingType, description: thingName })

    const event = createEventWrapper(body, 'POST', pathParameters)

    const lambdaSpy: sinon.SinonSpy<unknown[], any> = sinon.spy(
      // @ts-ignore
      createThingLambda.handler
    )
    const lambdaSpyResult = await lambdaSpy(event, context)

    assert(lambdaSpy.withArgs(event, context).calledOnce)
    assertResponseError(lambdaSpyResult, 409, 'thing exists')
  })

  it('create bad thing', async () => {
    const pathParameters = { thing: 'thing' }
    const body = JSON.stringify({ id: '', thingName: 'thingOne', thingType: '', description: '' })

    const event = createEventWrapper(body, 'POST', pathParameters)

    const lambdaSpy: sinon.SinonSpy<unknown[], any> = sinon.spy(
      // @ts-ignore
      createThingLambda.handler
    )
    const lambdaSpyResult = await lambdaSpy(event, context)

    assert(lambdaSpy.withArgs(event, context).calledOnce)
    assertResponseError(lambdaSpyResult, 400, 'invalid thing')
  })

  it('read thing', async () => {
    const thingTypeTwo = uuidv4()
    const { body: createdThingBody } = await createThing(client, 'thingTwo', thingTypeTwo)
    const thingId: string = createdThingBody?.id || ''

    const pathParameters = { thing: 'thing', id: thingId }
    const body = JSON.stringify({
      id: thingId,
      thingName: 'thingTwo',
      thingType: thingTypeTwo,
      description: 'thingTwo',
    })
    const expectedResult: ThingResponse = {
      statusCode: 200,
      message: 'ok',
      body,
    }

    const event = createEventWrapper(null, 'GET', pathParameters)

    const lambdaSpy: sinon.SinonSpy<unknown[], any> = sinon.spy(
      // @ts-ignore
      readThingLambda.handler
    )
    const lambdaSpyResult = await lambdaSpy(event, context)

    assert(lambdaSpy.withArgs(event, context).calledOnce)
    assertThingResponse(lambdaSpyResult, expectedResult)
  })

  it('read missing thing', async () => {
    const thingId = '43961f67-fcfe-4515-8b5d-f59ccca6c041'
    const pathParameters = { thing: 'thing', id: thingId }

    const event = createEventWrapper(null, 'GET', pathParameters)

    const lambdaSpy: sinon.SinonSpy<unknown[], any> = sinon.spy(
      // @ts-ignore
      readThingLambda.handler
    )
    const lambdaSpyResult = await lambdaSpy(event, context)

    assert(lambdaSpy.withArgs(event, context).calledOnce)
    assertResponseError(lambdaSpyResult, 404, 'missing thing')
  })
})
