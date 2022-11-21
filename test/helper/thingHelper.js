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
exports.assertThing = exports.createThingEvent = exports.dropThingsTable = exports.createThingsTable = exports.getThingsDbName = void 0;
var client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
var chai_1 = require("chai");
var uuid_1 = require("uuid");
var dayjs = require("dayjs");
var uuidValidateV4 = function (uuid) {
    return (0, uuid_1.validate)(uuid) && (0, uuid_1.version)(uuid) === 4;
};
var getThingsDbName = function () {
    process.env.AWS_REGION = 'eu-west-2';
    return 'ct-iot-test-things';
};
exports.getThingsDbName = getThingsDbName;
var createThingsTable = function (dbClient) { return __awaiter(void 0, void 0, void 0, function () {
    var input, command;
    return __generator(this, function (_a) {
        input = {
            TableName: (0, exports.getThingsDbName)(),
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
                    TableName: (0, exports.getThingsDbName)()
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
var createThingEvent = function (thingName, thingType, description, currentDate) {
    return {
        thingName: thingName,
        thingType: thingType,
        description: description,
        updatedAt: currentDate,
        createdAt: currentDate
    };
};
exports.createThingEvent = createThingEvent;
// TODO create and use a ThingResponse type
var assertThing = function (actualResult, expectedResult) {
    (0, chai_1.expect)(actualResult.statusCode).to.equal(200);
    (0, chai_1.expect)(actualResult.message).to.equal('ok');
    (0, chai_1.expect)(actualResult.result).to.have.length(1);
    (0, chai_1.expect)(uuidValidateV4(actualResult.result[0].id)).to.deep.equal(true);
    (0, chai_1.expect)(actualResult.result[0].thingName).to.equal(expectedResult.result[0].thingName);
    (0, chai_1.expect)(actualResult.result[0].thingType).to.equal(expectedResult.result[0].thingType);
    (0, chai_1.expect)(actualResult.result[0].description).to.equal(expectedResult.result[0].description);
    (0, chai_1.expect)(dayjs(actualResult.result[0].createdAt).isValid()).to.be["true"];
    (0, chai_1.expect)(dayjs(actualResult.result[0].updatedAt).isValid()).to.be["true"];
};
exports.assertThing = assertThing;