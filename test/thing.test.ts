import { describe, it, before } from 'mocha'
import * as sinon from 'sinon'
import { Context } from 'aws-lambda'
import { assert } from 'chai'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'

import * as createThingLambda from '../lambda-create/index'
import * as readThingLambda from '../lambda-read/index'
import { ThingResponse } from '../types'
import { createContext, createThing, createThingWrapper, getDbDocumentClient } from './helper/appHelper'
import { assertThingResponse, assertThingResponseError, createThingsTable, dropThingsTable } from './helper/thingHelper'

// TODO
//   thingIds, thingTypes mock data (id and name)
//   thingType schema change, thingPayloads table changes including new GSIs and removing existing
describe('thing tests', function () {
  let client: DynamoDBDocumentClient
  let context: Context

  let thingName: string
  let thingType: string

  before(async function () {
    client = await getDbDocumentClient()
    context = createContext('create-thing-test-lambda')
    thingName = 'thingOne'
    thingType = 'thingTypeOne'

    await dropThingsTable(client)
    await createThingsTable(client)
  })

  it('create thing', async () => {
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pathParameters = { thing: 'thing' }
    const body = JSON.stringify({ id: '', thingName, thingType, description: thingName })
    const expectedResult: ThingResponse = {
      statusCode: 200,
      message: 'ok',
      body,
    }

    const event = createThingWrapper(body, 'POST', pathParameters)
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const lambdaSpy: sinon.SinonSpy<unknown[], any> = sinon.spy(
      // @ts-ignore
      createThingLambda.handler
    )
    const lambdaSpyResult = await lambdaSpy(event, context)
    // console.log('lambdaSpyResult', await lambdaSpyResult)

    assert(lambdaSpy.withArgs(event, context).calledOnce)
    assertThingResponse(lambdaSpyResult, expectedResult)
  })

  it('create bad thing', async () => {
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pathParameters = { thing: 'thing' }
    const body = JSON.stringify({ id: '', thingName: 'thingOne', thingType: '', description: '' })

    const event = createThingWrapper(body, 'POST', pathParameters)

    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const lambdaSpy: sinon.SinonSpy<unknown[], any> = sinon.spy(
      // @ts-ignore
      createThingLambda.handler
    )
    const lambdaSpyResult = await lambdaSpy(event, context)

    assert(lambdaSpy.withArgs(event, context).calledOnce)
    assertThingResponseError(lambdaSpyResult, 400, 'invalid thing')
  })

  it('read thing', async () => {
    const { body: createdThingBody } = await createThing(client, 'thingTwo', 'thingTypeTwo')
    const thingId: string = createdThingBody?.id || ''

    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pathParameters = { thing: 'thing', id: thingId }
    const body = JSON.stringify({
      id: thingId,
      thingName: 'thingTwo',
      thingType: 'thingTypeTwo',
      description: 'thingTwo',
    })
    const expectedResult: ThingResponse = {
      statusCode: 200,
      message: 'ok',
      body,
    }

    const event = createThingWrapper(null, 'GET', pathParameters)
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pathParameters = { thing: 'thing', id: thingId }

    const event = createThingWrapper(null, 'GET', pathParameters)
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const lambdaSpy: sinon.SinonSpy<unknown[], any> = sinon.spy(
      // @ts-ignore
      readThingLambda.handler
    )
    const lambdaSpyResult = await lambdaSpy(event, context)

    assert(lambdaSpy.withArgs(event, context).calledOnce)
    assertThingResponseError(lambdaSpyResult, 404, 'missing item')
  })
})
