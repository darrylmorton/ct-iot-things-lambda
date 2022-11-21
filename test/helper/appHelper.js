"use strict";
exports.__esModule = true;
exports.createContext = void 0;
var createContext = function (functionName) {
    return {
        awsRequestId: '',
        callbackWaitsForEmptyEventLoop: false,
        functionName: functionName,
        functionVersion: '',
        invokedFunctionArn: '',
        logGroupName: '',
        logStreamName: '',
        memoryLimitInMB: '',
        // @ts-ignore
        // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
        done: function (error, result) { },
        // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
        fail: function (error) { },
        getRemainingTimeInMillis: function () {
            return 0;
        },
        // @ts-ignore
        // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
        succeed: function (message, object) { }
    };
};
exports.createContext = createContext;
