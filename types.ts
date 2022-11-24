export interface ThingEvent {
  body: string
  updatedAt: string
  createdAt: string
}

export interface SimpleThing {
  thingName: string | number | undefined
  thingType: string
  description: string
  updatedAt: string
  createdAt: string
}

export interface Thing extends SimpleThing {
  id: string
}

export interface ResponseError {
  statusCode: number
  message: string
}

export type ResponseBody = {
  id: string
  thingName: string
  thingType: string
  description: string
}

export interface ThingResponse extends ResponseError {
  body: string
}
