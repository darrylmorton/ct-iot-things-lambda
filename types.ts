export interface ThingEvent {
  body: string
  // {
  //     thingName: string | number | undefined
  //     thingType: string
  //     description: string
  //   }
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

export interface ThingResponseError {
  statusCode: number
  message: string
}

export type ThingResponseBody = {
  id: string
  thingName: string
  thingType: string
  description: string
}

export interface ThingResponse extends ThingResponseError {
  body: string
}
