"use strict";
/* eslint-disable @typescript-eslint/no-explicit-any */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.createThing = exports.createEventWrapper = exports.createContext = exports.getDbDocumentClient = exports.getDbClient = void 0;
var lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
var client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
var uuid_1 = require("uuid");
var thingHelper_1 = require("./thingHelper");
var appUtil_1 = require("../../lambda-create/util/appUtil");
var getDbClient = function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        if (process.env.NODE_ENV === 'test') {
            return [2 /*return*/, new client_dynamodb_1.DynamoDBClient({
                    region: process.env.AWS_REGION,
                    credentials: {
                        accessKeyId: "".concat(process.env.AWS_ACCESS_KEY_ID),
                        secretAccessKey: "".concat(process.env.AWS_SECRET_ACCESS_KEY)
                    },
                    tls: false,
                    endpoint: 'http://localhost:8000'
                })];
        }
        else {
            return [2 /*return*/, new client_dynamodb_1.DynamoDBClient({})];
        }
        return [2 /*return*/];
    });
}); };
exports.getDbClient = getDbClient;
var getDbDocumentClient = function () { return __awaiter(void 0, void 0, void 0, function () {
    var marshallOptions, unmarshallOptions, translateConfig, _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                marshallOptions = {
                    // Whether to automatically convert empty strings, blobs, and sets to `null`.
                    convertEmptyValues: false,
                    // Whether to remove undefined values while marshalling.
                    removeUndefinedValues: true,
                    // Whether to convert typeof object to map attribute.
                    convertClassInstanceToMap: false
                };
                unmarshallOptions = {
                    // Whether to return numbers as a string instead of converting them to native JavaScript numbers.
                    wrapNumbers: false
                };
                translateConfig = { marshallOptions: marshallOptions, unmarshallOptions: unmarshallOptions };
                _b = (_a = lib_dynamodb_1.DynamoDBDocumentClient).from;
                return [4 /*yield*/, (0, exports.getDbClient)()];
            case 1: 
            // @ts-ignore
            return [2 /*return*/, _b.apply(_a, [_c.sent(), translateConfig])];
        }
    });
}); };
exports.getDbDocumentClient = getDbDocumentClient;
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
// const qsParamsToQs = (qsParams: Record<string, string>): string =>
//   `?${Object.keys(qsParams)
//     .map((key) => {
//       return `${key}=${encodeURIComponent(qsParams[key])}`
//     })
//     .join('&')}`
// // `?${new URLSearchParams(qsParams).toString()}`
var createEventWrapper = function (body, httpMethod, qsParams) {
    return (0, thingHelper_1.createEvent)(body, { 'content-type': 'application/json' }, httpMethod, '/thing', {}, {}, {}, qsParams, {
        apiId: '',
        authorizer: undefined,
        httpMethod: httpMethod,
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
            userArn: null
        },
        path: '/thing',
        protocol: '',
        requestId: '',
        requestTimeEpoch: 0,
        resourceId: '',
        resourcePath: '',
        stage: '',
        accountId: ''
    }, '', {});
};
exports.createEventWrapper = createEventWrapper;
var createThing = function (client, thingName, thingType) { return __awaiter(void 0, void 0, void 0, function () {
    var currentDate, thing, params, result, err_1;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                currentDate = (0, appUtil_1.createCurrentTime)();
                thing = {
                    id: (0, uuid_1.v4)(),
                    thingName: thingName,
                    thingType: thingType,
                    description: thingName,
                    updatedAt: currentDate,
                    createdAt: currentDate
                };
                params = {
                    TableName: thingHelper_1.DB_NAME,
                    Item: thing
                };
                _b.label = 1;
            case 1:
                _b.trys.push([1, 3, , 4]);
                return [4 /*yield*/, client.send(new lib_dynamodb_1.PutCommand(params))];
            case 2:
                result = _b.sent();
                return [2 /*return*/, { statusCode: result.$metadata.httpStatusCode, message: 'ok', body: thing }];
            case 3:
                err_1 = _b.sent();
                (0, appUtil_1.consoleErrorOutput)('create-thing-test-lambda', err_1);
                return [2 /*return*/, { statusCode: (_a = err_1.$metadata) === null || _a === void 0 ? void 0 : _a.httpStatusCode, message: 'error' }];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.createThing = createThing;
