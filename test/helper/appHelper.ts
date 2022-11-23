import { DynamoDBDocumentClient, PutCommand, PutCommandInput, PutCommandOutput } from '@aws-sdk/lib-dynamodb'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { v4 as uuidv4 } from 'uuid'
import { APIGatewayProxyEventPathParameters } from 'aws-lambda/trigger/api-gateway-proxy'

import { createThingEvent } from './thingHelper'
import { Thing } from '../../types'
import { consoleErrorOutput, createCurrentTime, getThingsDbName } from '../../lambda-create/util/appUtil'

export const getDbClient = async (): Promise<DynamoDBClient> => {
  if (process.env.NODE_ENV === 'test') {
    return new DynamoDBClient({
      region: 'localhost',
      credentials: {
        accessKeyId: 'wt20ei',
        secretAccessKey: '9t246v',
      },
      tls: false,
      endpoint: 'http://localhost:8000',
    })
  } else {
    return new DynamoDBClient({})
  }
}

export const getDbDocumentClient = async (): Promise<DynamoDBDocumentClient> => {
  const marshallOptions = {
    // Whether to automatically convert empty strings, blobs, and sets to `null`.
    convertEmptyValues: false, // false, by default.
    // Whether to remove undefined values while marshalling.
    removeUndefinedValues: true, // false, by default.
    // Whether to convert typeof object to map attribute.
    convertClassInstanceToMap: false, // false, by default.
  }

  const unmarshallOptions = {
    // Whether to return numbers as a string instead of converting them to native JavaScript numbers.
    wrapNumbers: false, // false, by default.
  }

  const translateConfig = { marshallOptions, unmarshallOptions }

  // @ts-ignore
  return DynamoDBDocumentClient.from(await getDbClient(), translateConfig)
}

export const createContext = (functionName: string) => {
  return {
    awsRequestId: '',
    callbackWaitsForEmptyEventLoop: false,
    functionName,
    functionVersion: '',
    invokedFunctionArn: '',
    logGroupName: '',
    logStreamName: '',
    memoryLimitInMB: '',
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
    done(error?: Error, result?: any): void {},
    // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
    fail(error: Error | string): void {},
    getRemainingTimeInMillis(): number {
      return 0
    },
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
    succeed(message: any, object?: any): void {},
  }
}

const qsParamsToQs = (qsParams: Record<string, string>): string =>
  `?${Object.keys(qsParams)
    .map((key) => {
      return `${key}=${encodeURIComponent(qsParams[key])}`
    })
    .join('&')}`
// `?${new URLSearchParams(qsParams).toString()}`

export const createEvent = (httpMethod: string, path: string, qsParams: Record<string, string>) => {
  return {
    version: '2.0',
    routeKey: '$default',
    rawPath: path,
    rawQueryString: qsParams ? qsParamsToQs(qsParams) : '',
    headers: {
      'sec-fetch-mode': 'navigate',
      'x-amzn-tls-version': 'TLSv1.2',
      'sec-fetch-site': 'none',
      'accept-language': 'en-US,en;q=0.9',
      'x-forwarded-proto': 'https',
      'x-forwarded-port': '443',
      dnt: '1',
      'x-forwarded-for': '1.111.11.11',
      'sec-fetch-user': '?1',
      accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
      'x-amzn-tls-cipher-suite': 'ECDHE-RSA-AES128-GCM-SHA256',
      'sec-ch-ua': '"Google Chrome";v="107", "Chromium";v="107", "Not=A?Brand";v="24"',
      'sec-ch-ua-mobile': '?0',
      'x-amzn-trace-id': 'Root=1-637bccc5-329f9e1d4c8e25c46410095b',
      'sec-ch-ua-platform': '"macOS"',
      host: 'f3qyws6pmvhex3nknasuwe3xn40vknkh.lambda-url.eu-west-2.on.aws',
      'upgrade-insecure-requests': '1',
      'accept-encoding': 'gzip, deflate, br',
      'sec-fetch-dest': 'document',
      'user-agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36',
    },
    queryStringParameters: qsParams || {},
    requestContext: {
      accountId: 'anonymous',
      apiId: 'f3qyws6pmvhex3nknasuwe3xn40vknkh',
      domainName: 'f3qyws6pmvhex3nknasuwe3xn40vknkh.lambda-url.eu-west-2.on.aws',
      domainPrefix: 'f3qyws6pmvhex3nknasuwe3xn40vknkh',
      http: {
        method: 'GET',
        path: '/hello/you',
        protocol: 'HTTP/1.1',
        sourceIp: '1.111.11.11',
        userAgent:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36',
      },
      requestId: '05d5b31d-9792-4206-800e-bbc470769ff9',
      routeKey: '$default',
      stage: '$default',
      time: '21/Nov/2022:19:08:53 +0000',
      timeEpoch: 1669057733694,
    },
    isBase64Encoded: false,
  }
}

const pathToPathParameters = (path: string): APIGatewayProxyEventPathParameters => {
  if (path) {
    const paths = path.split('/')

    const pathParameters = paths.reduce((acc: Record<string, string>, item: string) => {
      if (item) {
        acc[`${item}`] = item
      }

      return acc
    }, {})

    return pathParameters
  } else {
    return {}
  }
}

const pathParametersToPath = (pathParameters: Record<string, string>): string => {
  let path = ''

  if (pathParameters) {
    for (const pathParametersKey in pathParameters) {
      path += `/${pathParameters[pathParametersKey]}`
    }
  } else {
    path = '/'
  }

  return path
}

export const createThingWrapper = (body: string | null, httpMethod: string, pathParameters: Record<string, string>) => {
  const path = pathParametersToPath(pathParameters)

  return createThingEvent(
    body,
    { 'content-type': 'application/json' },
    httpMethod,
    path,
    {},
    {},
    pathParameters,
    {},
    {
      apiId: '',
      authorizer: undefined,
      httpMethod: '',
      identity: {
        accessKey: null,
        accountId: null,
        apiKey: null,
        apiKeyId: null,
        caller: null,
        clientCert: null,
        cognitoAuthenticationProvider: null,
        cognitoAuthenticationType: null,
        cognitoIdentityId: null,
        cognitoIdentityPoolId: null,
        principalOrgId: null,
        sourceIp: '',
        user: null,
        userAgent: null,
        userArn: null,
      },
      path,
      protocol: '',
      requestId: '',
      requestTimeEpoch: 0,
      resourceId: '',
      resourcePath: '',
      stage: '',
      accountId: '',
    },
    '',
    {}
  )
}

export const createThing = async (client: DynamoDBDocumentClient, thingName: string, thingType: string) => {
  const currentDate: string = createCurrentTime()

  const thing: Thing = {
    id: uuidv4(),
    thingName,
    thingType,
    description: thingName,
    updatedAt: currentDate,
    createdAt: currentDate,
  }

  const params: PutCommandInput = {
    TableName: getThingsDbName(),
    Item: thing,
  }

  try {
    const result: PutCommandOutput = await client.send(new PutCommand(params))

    return { statusCode: result.$metadata.httpStatusCode, message: 'ok', body: thing }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any | unknown) {
    consoleErrorOutput('create-thing-test-lambda', err)

    return { statusCode: err.$metadata?.httpStatusCode, message: 'error' }
  }
}
