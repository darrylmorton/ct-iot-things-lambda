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
