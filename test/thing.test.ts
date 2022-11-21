import { describe, it, before, after } from 'mocha'
import * as sinon from 'sinon'
import { Context } from 'aws-lambda'
import { expect, assert } from 'chai'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'

import * as createThingLambda from '../lambda-create/index'
import * as readThingLambda from '../lambda-read/index'
import { SimpleThing, ThingResponse } from '../types'
import { createContext } from './helper/appHelper'
import { getDbDocumentClient } from '../util/appUtil'
import { assertThingResponse, createThingEvent, createThingsTable, dropThingsTable } from './helper/thingHelper'

// TODO
//   thingIds, thingTypes mock data (id and name)
//   thingType schema change, thingPayloads table changes including new GSIs and removing existing
describe('thing tests', function () {
  let client: DynamoDBDocumentClient
  let thingName: string
  let thingType: string

  before(async function () {
    client = await getDbDocumentClient()
    thingName = 'thingOne'
    thingType = 'thingTypeOne'

    await createThingsTable(client)
  })

  after(async function () {
    await dropThingsTable(client)
  })

  it('create thing', async () => {
    const context: Context = createContext('create-thing-test-lambda')
    const event: SimpleThing = createThingEvent(thingName, thingType, thingName, new Date().toISOString())

    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const lambdaSpy: sinon.SinonSpy<unknown[], any> = sinon.spy(
      // @ts-ignore
      createThingLambda.handler
    )
    const lambdaSpyResult = await lambdaSpy(event, context)

    assert(lambdaSpy.withArgs(event, context).calledOnce)
    expect(lambdaSpyResult).to.deep.equal({ statusCode: 200, message: 'ok' })
  })

  it('create bad thing', async () => {
    const context: Context = createContext('create-thing-test-lambda')
    const event: SimpleThing = createThingEvent('', '', '', '')

    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const lambdaSpy: sinon.SinonSpy<unknown[], any> = sinon.spy(
      // @ts-ignore
      createThingLambda.handler
    )
    const lambdaSpyResult = await lambdaSpy(event, context)

    assert(lambdaSpy.withArgs(event, context).calledOnce)
    expect(lambdaSpyResult).to.deep.equal({ statusCode: 400, message: 'error' })
  })

  it('read things', async () => {
    const expectedResult: ThingResponse = {
      statusCode: 200,
      message: 'ok',
      result: [{ id: '', thingName, thingType, description: thingName }],
    }
    const context: Context = createContext('read-things-test-lambda')
    const event = { thingName }

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

  it('read missing things', async () => {
    const expectedResult = {
      statusCode: 200,
      message: 'ok',
      result: [],
    }

    const context: Context = createContext('read-things-test-lambda')
    const event = { thingName: 'a' }

    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const lambdaSpy: sinon.SinonSpy<unknown[], any> = sinon.spy(
      // @ts-ignore
      readThingLambda.handler
    )
    const lambdaSpyResult = await lambdaSpy(event, context)

    assert(lambdaSpy.withArgs(event, context).calledOnce)
    expect(lambdaSpyResult).to.deep.equal(expectedResult)
  })

  it('read bad things', async () => {
    const context: Context = createContext('read-things-test-lambda')
    const event = { thingName: '' }

    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const lambdaSpy: sinon.SinonSpy<unknown[], any> = sinon.spy(
      // @ts-ignore
      readThingLambda.handler
    )
    const lambdaSpyResult = await lambdaSpy(event, context)

    assert(lambdaSpy.withArgs(event, context).calledOnce)
    expect(lambdaSpyResult).to.deep.equal({ statusCode: 400, message: 'error' })
  })
})
