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
