export interface SimpleThing {
  thingName: string
  deviceId: string
  thingTypeId: string
  description: string
  updatedAt: string
  createdAt: string
}

export interface Thing extends SimpleThing {
  id: string
}

export interface ResponseError {
  headers: Record<string, string>
  statusCode: number | undefined
}

export type ResponseBody = {
  id: string
  thingName: string
  deviceId: string
  thingTypeId: string
  description: string
}

export interface ThingResponse extends ResponseError {
  body: string
}

export type PutThingResult = {
  statusCode: number | undefined
  result: Thing
}
