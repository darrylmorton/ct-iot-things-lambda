import { expect } from 'chai'
import { validate as isValidUuid } from 'uuid'
import { isValid, parseISO } from 'date-fns'

import { ThingResponse, ResponseBody, ResponseError, Thing, PutThingResult } from '../../types'
import { uuidValidateV4 } from '../../lambda-read/util/appUtil'

export const assertThingResponse = (actualResult: ThingResponse, expectedResult: ThingResponse): void => {
  expect(actualResult.statusCode).to.equal(expectedResult.statusCode)
  expect(actualResult.headers).to.deep.equal(expectedResult.headers)

  const actualResultBody: ResponseBody = JSON.parse(actualResult.body)
  const expectedResultBody: ResponseBody = JSON.parse(expectedResult.body)

  assertThingResponseBody(actualResultBody, expectedResultBody)
}

export const assertThingsResponse = (actualResult: ThingResponse, expectedResult: ThingResponse): void => {
  expect(actualResult.statusCode).to.equal(expectedResult.statusCode)
  expect(actualResult.headers).to.deep.equal(expectedResult.headers)

  const actualResultBody: ResponseBody[] = JSON.parse(actualResult.body)
  const expectedResultBody: ResponseBody[] = JSON.parse(expectedResult.body)

  expect(actualResultBody).to.have.length(expectedResultBody.length)

  for (let counter = 0; counter < actualResultBody.length; counter++) {
    assertThingResponseBody(actualResultBody[counter], expectedResultBody[counter])
  }
}

export const assertThingResponseBody = (actualResultBody: ResponseBody, expectedResultBody: ResponseBody): void => {
  expect(uuidValidateV4(actualResultBody.id)).to.deep.equal(true)
  expect(actualResultBody.thingName).to.equal(expectedResultBody.thingName)
  expect(actualResultBody.deviceId).to.equal(expectedResultBody.deviceId)
  expect(actualResultBody.thingTypeId).to.equal(expectedResultBody.thingTypeId)
  expect(actualResultBody.description).to.equal(expectedResultBody.description)
}

export const assertResponseError = (
  actualResult: ResponseError,
  headers: Record<string, string>,
  statusCode: number
): void => {
  expect(actualResult.headers).to.deep.equal(headers)
  expect(actualResult.statusCode).to.equal(statusCode)
}

export const assertThing = (actualResult: Thing, expectedResult: Thing): void => {
  expect(isValidUuid(actualResult.id)).to.equal(true)
  expect(actualResult.thingName).to.equal(expectedResult.thingName)
  expect(actualResult.description).to.equal(expectedResult.description)
  expect(actualResult.deviceId).to.equal(expectedResult.deviceId)
  expect(actualResult.thingTypeId).to.equal(expectedResult.thingTypeId)
}

export const assertThingWithDates = (actualResult: Thing, expectedResult: Thing): void => {
  assertThing(actualResult, expectedResult)

  expect(isValid(parseISO(actualResult.updatedAt))).to.equal(true)
  expect(isValid(parseISO(actualResult.createdAt))).to.equal(true)
}

export const assertPutThingResult = (actualResult: PutThingResult, expectedResult: PutThingResult): void => {
  expect(actualResult.statusCode).to.equal(expectedResult.statusCode)

  assertThing(actualResult.result, expectedResult.result)
}
