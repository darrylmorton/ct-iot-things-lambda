import { describe, it, before, after } from 'mocha'
import * as sinon from 'sinon'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { Context } from 'aws-lambda'
import { expect, assert } from 'chai'

import * as lambda from '../index'
import { SimpleThing } from '../types'
import {
  createContext,
  createEvent,
  createThingsTable,
  delay,
  dropThingsTable,
  findThingsByName,
} from './helper/appHelper'
import { getDbClient } from '../util/appUtil'

// TODO
//   thingIds, thingTypes mock data (id and name)
//   thingType schema change, thingPayloads table changes including new GSIs and removing existing
describe('run tests', function () {
  let client: DynamoDBClient
  let thingName: string
  let thingType: string

  before(async function () {
    client = await getDbClient()
    thingName = 'thingOne'
    thingType = 'thingTypeOne'

    await createThingsTable(client)
  })

  after(async function () {
    await dropThingsTable(client)
  })

  describe('things lambda tests', function () {
    it('create thing', async () => {
      const context: Context = createContext()
      const currentDate: string = new Date().toISOString()
      const event: SimpleThing = createEvent(thingName, thingType, thingName, currentDate)

      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const lambdaSpy: any = sinon.spy(lambda.handler)
      const lambdaSpyResult = await lambdaSpy(event, context)

      assert(lambdaSpy.withArgs(event, context).calledOnce)
      expect(lambdaSpyResult).to.deep.equal({ statusCode: 200, message: 'ok' })

      await delay(1000)

      // // @ts-ignore
      // // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result: any = await findThingsByName(client, thingName)

      expect(result.Items.length).to.equal(1)
    })
  })
})
