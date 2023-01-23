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
exports.queryByThingTypeId = exports.queryByDeviceId = exports.queryByThingName = exports.queryById = exports.getItems = exports.uuidValidateV4 = exports.consoleErrorOutput = exports.getDbDocumentClient = exports.getDbName = void 0;
var client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
var lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
var util_dynamodb_1 = require("@aws-sdk/util-dynamodb");
var uuid_1 = require("uuid");
var DB_TABLE_NAME_PREFIX = 'ct-iot';
var DB_TABLE_NAME_SUFFIX = 'things';
var getDbName = function () {
    var NODE_ENV = process.env.NODE_ENV;
    switch (NODE_ENV) {
        case 'production':
            return process.env.DB_TABLE_NAME;
        case 'test':
            return "".concat(DB_TABLE_NAME_PREFIX, "-").concat(NODE_ENV, "-").concat(DB_TABLE_NAME_SUFFIX);
        default:
            return "".concat(DB_TABLE_NAME_PREFIX, "-development-").concat(DB_TABLE_NAME_SUFFIX);
    }
};
exports.getDbName = getDbName;
var getDbClient = function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        if (process.env.NODE_ENV === 'test') {
            return [2 /*return*/, new client_dynamodb_1.DynamoDBClient({
                    region: process.env.AWS_REGION,
                    credentials: {
                        accessKeyId: "".concat(process.env.AWS_ACCESS_KEY_ID),
                        secretAccessKey: "".concat(process.env.AWS_SECRET_ACCESS_KEY)
                    },
                    endpoint: 'http://localhost:8000'
                })];
        }
        else {
            return [2 /*return*/, new client_dynamodb_1.DynamoDBClient({})];
        }
        return [2 /*return*/];
    });
}); };
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
                return [4 /*yield*/, getDbClient()];
            case 1: return [2 /*return*/, _b.apply(_a, [_c.sent(), translateConfig])];
        }
    });
}); };
exports.getDbDocumentClient = getDbDocumentClient;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
var consoleErrorOutput = function (lambdaFunctionName, functionName, err) {
    if (process.env.NODE_ENV !== 'test') {
        // eslint-disable-next-line no-console
        console.error("".concat(lambdaFunctionName, ": ").concat(functionName, " - error"), err);
    }
};
exports.consoleErrorOutput = consoleErrorOutput;
var uuidValidateV4 = function (uuid) {
    return (0, uuid_1.validate)(uuid) && (0, uuid_1.version)(uuid) === 4;
};
exports.uuidValidateV4 = uuidValidateV4;
var getItems = function (client, context) { return __awaiter(void 0, void 0, void 0, function () {
    var params, result, body, err_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                params = {
                    TableName: (0, exports.getDbName)(),
                    Select: 'SPECIFIC_ATTRIBUTES',
                    ProjectionExpression: 'id, thingName, deviceId, thingTypeId, description'
                };
                return [4 /*yield*/, client.send(new client_dynamodb_1.ScanCommand(params))];
            case 1:
                result = _a.sent();
                if (result.Items) {
                    body = result.Items.reduce(function (acc, item) {
                        var unmarshalledItem = (0, util_dynamodb_1.unmarshall)(item);
                        acc.push(unmarshalledItem);
                        return acc;
                    }, []);
                    return [2 /*return*/, {
                            headers: { 'Content-Type': 'application/json' },
                            statusCode: result.$metadata.httpStatusCode,
                            body: JSON.stringify(body)
                        }];
                }
                else {
                    return [2 /*return*/, {
                            headers: { 'Content-Type': 'application/json' },
                            statusCode: 200,
                            body: JSON.stringify([])
                        }];
                }
                return [3 /*break*/, 3];
            case 2:
                err_1 = _a.sent();
                (0, exports.consoleErrorOutput)(context.functionName, 'getItems', err_1);
                return [2 /*return*/, {
                        headers: { 'Content-Type': 'application/json' },
                        statusCode: 500
                    }];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getItems = getItems;
var queryById = function (client, id, context) { return __awaiter(void 0, void 0, void 0, function () {
    var params, result, err_2;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                if (!(0, exports.uuidValidateV4)(id)) {
                    return [2 /*return*/, {
                            headers: { 'Content-Type': 'application/json' },
                            statusCode: 400
                        }];
                }
                _b.label = 1;
            case 1:
                _b.trys.push([1, 3, , 4]);
                params = {
                    TableName: (0, exports.getDbName)(),
                    KeyConditionExpression: 'id = :id',
                    ExpressionAttributeValues: { ':id': id },
                    Select: 'SPECIFIC_ATTRIBUTES',
                    ProjectionExpression: 'id, thingName, deviceId, thingTypeId, description'
                };
                return [4 /*yield*/, client.send(new lib_dynamodb_1.QueryCommand(params))];
            case 2:
                result = _b.sent();
                if ((_a = result.Items) === null || _a === void 0 ? void 0 : _a.length) {
                    return [2 /*return*/, {
                            headers: { 'Content-Type': 'application/json' },
                            statusCode: 200,
                            body: JSON.stringify(result.Items)
                        }];
                }
                else {
                    return [2 /*return*/, {
                            headers: { 'Content-Type': 'application/json' },
                            statusCode: 404
                        }];
                }
                return [3 /*break*/, 4];
            case 3:
                err_2 = _b.sent();
                (0, exports.consoleErrorOutput)(context.functionName, 'queryById', err_2);
                return [2 /*return*/, {
                        headers: { 'Content-Type': 'application/json' },
                        statusCode: 500
                    }];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.queryById = queryById;
var queryByThingName = function (client, thingName, context) { return __awaiter(void 0, void 0, void 0, function () {
    var params, result, err_3;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                params = {
                    TableName: (0, exports.getDbName)(),
                    IndexName: 'thingNameIndex',
                    KeyConditionExpression: 'thingName = :thingName',
                    ExpressionAttributeValues: { ':thingName': thingName },
                    Select: 'SPECIFIC_ATTRIBUTES',
                    ProjectionExpression: 'id, thingName, deviceId, thingTypeId, description'
                };
                return [4 /*yield*/, client.send(new lib_dynamodb_1.QueryCommand(params))];
            case 1:
                result = _b.sent();
                if ((_a = result.Items) === null || _a === void 0 ? void 0 : _a.length) {
                    return [2 /*return*/, {
                            headers: { 'Content-Type': 'application/json' },
                            statusCode: 200,
                            body: JSON.stringify(result.Items)
                        }];
                }
                else {
                    return [2 /*return*/, {
                            headers: { 'Content-Type': 'application/json' },
                            statusCode: 404
                        }];
                }
                return [3 /*break*/, 3];
            case 2:
                err_3 = _b.sent();
                (0, exports.consoleErrorOutput)(context.functionName, 'queryByThingName', err_3);
                return [2 /*return*/, {
                        headers: { 'Content-Type': 'application/json' },
                        statusCode: 500
                    }];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.queryByThingName = queryByThingName;
var queryByDeviceId = function (client, deviceId, context) { return __awaiter(void 0, void 0, void 0, function () {
    var params, result, err_4;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                if (!deviceId) {
                    return [2 /*return*/, {
                            headers: { 'Content-Type': 'application/json' },
                            statusCode: 400
                        }];
                }
                _b.label = 1;
            case 1:
                _b.trys.push([1, 3, , 4]);
                params = {
                    TableName: (0, exports.getDbName)(),
                    IndexName: 'deviceIdIndex',
                    KeyConditionExpression: 'deviceId = :deviceId',
                    ExpressionAttributeValues: { ':deviceId': deviceId },
                    Select: 'SPECIFIC_ATTRIBUTES',
                    ProjectionExpression: 'id, thingName, deviceId, thingTypeId, description'
                };
                return [4 /*yield*/, client.send(new lib_dynamodb_1.QueryCommand(params))];
            case 2:
                result = _b.sent();
                if ((_a = result.Items) === null || _a === void 0 ? void 0 : _a.length) {
                    return [2 /*return*/, {
                            headers: { 'Content-Type': 'application/json' },
                            statusCode: 200,
                            body: JSON.stringify(result.Items)
                        }];
                }
                else {
                    return [2 /*return*/, {
                            headers: { 'Content-Type': 'application/json' },
                            statusCode: 404
                        }];
                }
                return [3 /*break*/, 4];
            case 3:
                err_4 = _b.sent();
                (0, exports.consoleErrorOutput)(context.functionName, 'queryByDeviceId', err_4);
                return [2 /*return*/, {
                        headers: { 'Content-Type': 'application/json' },
                        statusCode: 500
                    }];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.queryByDeviceId = queryByDeviceId;
var queryByThingTypeId = function (client, thingTypeId, context) { return __awaiter(void 0, void 0, void 0, function () {
    var params, result, err_5;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                if (!(0, exports.uuidValidateV4)(thingTypeId)) {
                    return [2 /*return*/, {
                            headers: { 'Content-Type': 'application/json' },
                            statusCode: 400
                        }];
                }
                _b.label = 1;
            case 1:
                _b.trys.push([1, 3, , 4]);
                params = {
                    TableName: (0, exports.getDbName)(),
                    IndexName: 'thingTypeIdIndex',
                    KeyConditionExpression: 'thingTypeId = :thingTypeId',
                    ExpressionAttributeValues: { ':thingTypeId': thingTypeId },
                    Select: 'SPECIFIC_ATTRIBUTES',
                    ProjectionExpression: 'id, thingName, deviceId, thingTypeId, description'
                };
                return [4 /*yield*/, client.send(new lib_dynamodb_1.QueryCommand(params))];
            case 2:
                result = _b.sent();
                if ((_a = result.Items) === null || _a === void 0 ? void 0 : _a.length) {
                    return [2 /*return*/, {
                            headers: { 'Content-Type': 'application/json' },
                            statusCode: 200,
                            body: JSON.stringify(result.Items)
                        }];
                }
                else {
                    return [2 /*return*/, {
                            headers: { 'Content-Type': 'application/json' },
                            statusCode: 404
                        }];
                }
                return [3 /*break*/, 4];
            case 3:
                err_5 = _b.sent();
                (0, exports.consoleErrorOutput)(context.functionName, 'queryByThingName', err_5);
                return [2 /*return*/, {
                        headers: { 'Content-Type': 'application/json' },
                        statusCode: 500
                    }];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.queryByThingTypeId = queryByThingTypeId;
