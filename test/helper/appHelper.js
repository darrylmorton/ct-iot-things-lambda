"use strict";
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
exports.createThing = exports.createThingWrapper = exports.createEvent = exports.createContext = exports.getDbDocumentClient = exports.getDbClient = void 0;
var lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
var client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
var uuid_1 = require("uuid");
var thingHelper_1 = require("./thingHelper");
var appUtil_1 = require("../../lambda-create/util/appUtil");
var getDbClient = function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        if (process.env.NODE_ENV === 'test') {
            return [2 /*return*/, new client_dynamodb_1.DynamoDBClient({
                    region: 'localhost',
                    credentials: {
                        accessKeyId: 'wt20ei',
                        secretAccessKey: '9t246v'
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
var qsParamsToQs = function (qsParams) {
    return "?".concat(Object.keys(qsParams)
        .map(function (key) {
        return "".concat(key, "=").concat(encodeURIComponent(qsParams[key]));
    })
        .join('&'));
};
// `?${new URLSearchParams(qsParams).toString()}`
var createEvent = function (httpMethod, path, qsParams) {
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
            accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
            'x-amzn-tls-cipher-suite': 'ECDHE-RSA-AES128-GCM-SHA256',
            'sec-ch-ua': '"Google Chrome";v="107", "Chromium";v="107", "Not=A?Brand";v="24"',
            'sec-ch-ua-mobile': '?0',
            'x-amzn-trace-id': 'Root=1-637bccc5-329f9e1d4c8e25c46410095b',
            'sec-ch-ua-platform': '"macOS"',
            host: 'f3qyws6pmvhex3nknasuwe3xn40vknkh.lambda-url.eu-west-2.on.aws',
            'upgrade-insecure-requests': '1',
            'accept-encoding': 'gzip, deflate, br',
            'sec-fetch-dest': 'document',
            'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36'
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
                userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36'
            },
            requestId: '05d5b31d-9792-4206-800e-bbc470769ff9',
            routeKey: '$default',
            stage: '$default',
            time: '21/Nov/2022:19:08:53 +0000',
            timeEpoch: 1669057733694
        },
        isBase64Encoded: false
    };
};
exports.createEvent = createEvent;
var pathToPathParameters = function (path) {
    if (path) {
        var paths = path.split('/');
        var pathParameters = paths.reduce(function (acc, item) {
            if (item) {
                acc["".concat(item)] = item;
            }
            return acc;
        }, {});
        return pathParameters;
    }
    else {
        return {};
    }
};
var pathParametersToPath = function (pathParameters) {
    var path = '';
    if (pathParameters) {
        for (var pathParametersKey in pathParameters) {
            path += "/".concat(pathParameters[pathParametersKey]);
        }
    }
    else {
        path = '/';
    }
    return path;
};
var createThingWrapper = function (body, httpMethod, pathParameters) {
    var path = pathParametersToPath(pathParameters);
    return (0, thingHelper_1.createThingEvent)(body, { 'content-type': 'application/json' }, httpMethod, path, {}, {}, pathParameters, {}, {
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
            userArn: null
        },
        path: path,
        protocol: '',
        requestId: '',
        requestTimeEpoch: 0,
        resourceId: '',
        resourcePath: '',
        stage: '',
        accountId: ''
    }, '', {});
};
exports.createThingWrapper = createThingWrapper;
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
                    TableName: (0, appUtil_1.getThingsDbName)(),
                    Item: thing
                };
                _b.label = 1;
            case 1:
                _b.trys.push([1, 3, , 4]);
                return [4 /*yield*/, client.send(new lib_dynamodb_1.PutCommand(params))];
            case 2:
                result = _b.sent();
                return [2 /*return*/, { statusCode: result.$metadata.httpStatusCode, message: 'ok', body: thing }
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                ];
            case 3:
                err_1 = _b.sent();
                (0, appUtil_1.consoleErrorOutput)('create-thing-test-lambda', err_1);
                return [2 /*return*/, { statusCode: (_a = err_1.$metadata) === null || _a === void 0 ? void 0 : _a.httpStatusCode, message: 'error' }];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.createThing = createThing;
