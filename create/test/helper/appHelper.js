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
        while (_) try {
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
exports.delay = exports.createEvent = exports.createContext = exports.findThingsByThingType = exports.findThingsByName = exports.findThingsById = exports.dropThingsTable = exports.createThingsTable = void 0;
var client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
var appUtil_1 = require("../../util/appUtil");
var createThingsTable = function (dbClient) { return __awaiter(void 0, void 0, void 0, function () {
    var input, command;
    return __generator(this, function (_a) {
        input = {
            TableName: (0, appUtil_1.getThingsDbName)(),
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
                    AttributeName: 'thingType',
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
                {
                    AttributeName: 'updatedAt',
                    KeyType: 'RANGE'
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
                    IndexName: 'thingTypeIndex',
                    KeySchema: [
                        {
                            AttributeName: 'thingType',
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
exports.createThingsTable = createThingsTable;
var dropThingsTable = function (dbClient) { return __awaiter(void 0, void 0, void 0, function () {
    var params, command;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                params = {
                    TableName: (0, appUtil_1.getThingsDbName)()
                };
                command = new client_dynamodb_1.DeleteTableCommand(params);
                return [4 /*yield*/, dbClient.send(command)];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
exports.dropThingsTable = dropThingsTable;
var findThingsById = function (client, id) { return __awaiter(void 0, void 0, void 0, function () {
    var params;
    return __generator(this, function (_a) {
        try {
            params = {
                TableName: (0, appUtil_1.getThingsDbName)(),
                ExpressionAttributeValues: {
                    ':id': {
                        S: id
                    }
                },
                KeyConditionExpression: 'id = :id'
            };
            return [2 /*return*/, client.send(new client_dynamodb_1.QueryCommand(params))];
        }
        catch (err) {
            // eslint-disable-next-line no-console
            console.error('query err', err);
            return [2 /*return*/, null];
        }
        return [2 /*return*/];
    });
}); };
exports.findThingsById = findThingsById;
var findThingsByName = function (client, thingName) { return __awaiter(void 0, void 0, void 0, function () {
    var params;
    return __generator(this, function (_a) {
        try {
            params = {
                TableName: (0, appUtil_1.getThingsDbName)(),
                IndexName: 'thingNameIndex',
                ExpressionAttributeValues: {
                    ':thingName': {
                        S: thingName
                    }
                },
                KeyConditionExpression: 'thingName = :thingName'
            };
            return [2 /*return*/, client.send(new client_dynamodb_1.QueryCommand(params))];
        }
        catch (err) {
            // eslint-disable-next-line no-console
            console.error('query err', err);
            return [2 /*return*/, null];
        }
        return [2 /*return*/];
    });
}); };
exports.findThingsByName = findThingsByName;
var findThingsByThingType = function (client, thingType) { return __awaiter(void 0, void 0, void 0, function () {
    var params;
    return __generator(this, function (_a) {
        try {
            params = {
                TableName: (0, appUtil_1.getThingsDbName)(),
                IndexName: 'thingTypeIndex',
                ExpressionAttributeValues: {
                    ':thingType': {
                        S: thingType
                    }
                },
                KeyConditionExpression: 'thingType = :thingType'
            };
            return [2 /*return*/, client.send(new client_dynamodb_1.QueryCommand(params))];
        }
        catch (err) {
            // eslint-disable-next-line no-console
            console.error('query err', err);
            return [2 /*return*/, null];
        }
        return [2 /*return*/];
    });
}); };
exports.findThingsByThingType = findThingsByThingType;
var createContext = function () {
    return {
        awsRequestId: '',
        callbackWaitsForEmptyEventLoop: false,
        functionName: 'create-things-test-lambda',
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
var createEvent = function (thingName, thingType, description, currentDate) {
    return {
        thingName: thingName,
        thingType: thingType,
        description: description,
        updatedAt: currentDate,
        createdAt: currentDate
    };
};
exports.createEvent = createEvent;
var delay = function (time) {
    return new Promise(function (resolve) { return setTimeout(resolve, time); });
};
exports.delay = delay;
