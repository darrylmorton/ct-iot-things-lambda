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
exports.assertResponseError = exports.assertThingResponseBody = exports.assertThingsResponse = exports.assertThingResponse = exports.createEvent = exports.dropTable = exports.createTable = exports.DB_NAME = void 0;
var client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
var chai_1 = require("chai");
var appUtil_1 = require("../../lambda-read/util/appUtil");
exports.DB_NAME = 'ct-iot-test-things';
var createTable = function (dbClient) { return __awaiter(void 0, void 0, void 0, function () {
    var input, command;
    return __generator(this, function (_a) {
        input = {
            TableName: exports.DB_NAME,
            AttributeDefinitions: [
                {
                    AttributeName: 'id',
                    AttributeType: 'S'
                },
                {
                    AttributeName: 'thingName',
                    AttributeType: 'S'
                },
                {
                    AttributeName: 'deviceId',
                    AttributeType: 'S'
                },
                {
                    AttributeName: 'thingTypeId',
                    AttributeType: 'S'
                },
                {
                    AttributeName: 'updatedAt',
                    AttributeType: 'S'
                },
            ],
            KeySchema: [
                {
                    AttributeName: 'id',
                    KeyType: 'HASH'
                },
            ],
            ProvisionedThroughput: {
                ReadCapacityUnits: 1,
                WriteCapacityUnits: 1
            },
            StreamSpecification: {
                StreamEnabled: false
            },
            BillingMode: 'PAY_PER_REQUEST',
            GlobalSecondaryIndexes: [
                {
                    IndexName: 'thingNameIndex',
                    KeySchema: [
                        {
                            AttributeName: 'thingName',
                            KeyType: 'HASH'
                        },
                        {
                            AttributeName: 'updatedAt',
                            KeyType: 'RANGE'
                        },
                    ],
                    Projection: {
                        ProjectionType: 'ALL'
                    },
                    ProvisionedThroughput: {
                        ReadCapacityUnits: 1,
                        WriteCapacityUnits: 1
                    }
                },
                {
                    IndexName: 'deviceIdIndex',
                    KeySchema: [
                        {
                            AttributeName: 'deviceId',
                            KeyType: 'HASH'
                        },
                        {
                            AttributeName: 'updatedAt',
                            KeyType: 'RANGE'
                        },
                    ],
                    Projection: {
                        ProjectionType: 'ALL'
                    },
                    ProvisionedThroughput: {
                        ReadCapacityUnits: 1,
                        WriteCapacityUnits: 1
                    }
                },
                {
                    IndexName: 'thingTypeIdIndex',
                    KeySchema: [
                        {
                            AttributeName: 'thingTypeId',
                            KeyType: 'HASH'
                        },
                        {
                            AttributeName: 'updatedAt',
                            KeyType: 'RANGE'
                        },
                    ],
                    Projection: {
                        ProjectionType: 'ALL'
                    },
                    ProvisionedThroughput: {
                        ReadCapacityUnits: 1,
                        WriteCapacityUnits: 1
                    }
                },
            ]
        };
        command = new client_dynamodb_1.CreateTableCommand(input);
        return [2 /*return*/, dbClient.send(command)];
    });
}); };
exports.createTable = createTable;
var dropTable = function (dbClient) { return __awaiter(void 0, void 0, void 0, function () {
    var params, command;
    return __generator(this, function (_a) {
        params = {
            TableName: exports.DB_NAME
        };
        command = new client_dynamodb_1.DeleteTableCommand(params);
        return [2 /*return*/, dbClient.send(command)];
    });
}); };
exports.dropTable = dropTable;
var createEvent = function (body, headers, httpMethod, path, multiValueHeaders, multiValueQueryStringParameters, pathParameters, queryStringParameters, requestContext, resource, stageVariables) {
    return {
        body: body,
        headers: headers,
        httpMethod: httpMethod,
        isBase64Encoded: false,
        multiValueHeaders: multiValueHeaders,
        multiValueQueryStringParameters: multiValueQueryStringParameters,
        path: path,
        pathParameters: pathParameters,
        queryStringParameters: queryStringParameters,
        requestContext: requestContext,
        resource: resource,
        stageVariables: stageVariables
    };
};
exports.createEvent = createEvent;
var assertThingResponse = function (actualResult, expectedResult) {
    (0, chai_1.expect)(actualResult.statusCode).to.equal(expectedResult.statusCode);
    (0, chai_1.expect)(actualResult.headers).to.deep.equal(expectedResult.headers);
    var actualResultBody = JSON.parse(actualResult.body);
    var expectedResultBody = JSON.parse(expectedResult.body);
    (0, exports.assertThingResponseBody)(actualResultBody, expectedResultBody);
};
exports.assertThingResponse = assertThingResponse;
var assertThingsResponse = function (actualResult, expectedResult) {
    (0, chai_1.expect)(actualResult.statusCode).to.equal(expectedResult.statusCode);
    (0, chai_1.expect)(actualResult.headers).to.deep.equal(expectedResult.headers);
    var actualResultBody = JSON.parse(actualResult.body);
    var expectedResultBody = JSON.parse(expectedResult.body);
    (0, chai_1.expect)(actualResultBody).to.have.length(expectedResultBody.length);
    for (var counter = 0; counter < actualResultBody.length; counter++) {
        (0, exports.assertThingResponseBody)(actualResultBody[counter], expectedResultBody[counter]);
    }
};
exports.assertThingsResponse = assertThingsResponse;
var assertThingResponseBody = function (actualResultBody, expectedResultBody) {
    (0, chai_1.expect)((0, appUtil_1.uuidValidateV4)(actualResultBody.id)).to.deep.equal(true);
    (0, chai_1.expect)(actualResultBody.thingName).to.equal(expectedResultBody.thingName);
    (0, chai_1.expect)(actualResultBody.deviceId).to.equal(expectedResultBody.deviceId);
    (0, chai_1.expect)(actualResultBody.thingTypeId).to.equal(expectedResultBody.thingTypeId);
    (0, chai_1.expect)(actualResultBody.description).to.equal(expectedResultBody.description);
};
exports.assertThingResponseBody = assertThingResponseBody;
var assertResponseError = function (actualResult, headers, statusCode) {
    (0, chai_1.expect)(actualResult.headers).to.deep.equal(headers);
    (0, chai_1.expect)(actualResult.statusCode).to.equal(statusCode);
};
exports.assertResponseError = assertResponseError;
