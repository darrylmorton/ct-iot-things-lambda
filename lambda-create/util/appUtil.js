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
exports.queryByThingName = exports.consoleErrorOutput = exports.getDbDocumentClient = exports.getThingsDbName = exports.createCurrentTime = void 0;
var client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
var lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
var dayjs = require("dayjs");
var utc = require("dayjs/plugin/utc");
var timezone = require("dayjs/plugin/timezone");
// @ts-ignore
dayjs.extend(utc);
// @ts-ignore
dayjs.extend(timezone);
var DB_TABLE_NAME_PREFIX = 'ct-iot';
var THINGS_DB_TABLE_NAME_SUFFIX = 'things';
var createCurrentTime = function () {
    return dayjs.tz(Date.now(), 'Europe/London').format('YYYY-MM-DDThh:mm:ss:SSS');
};
exports.createCurrentTime = createCurrentTime;
var getThingsDbName = function () {
    var NODE_ENV = process.env.NODE_ENV;
    switch (NODE_ENV) {
        case 'production':
            return "".concat(DB_TABLE_NAME_PREFIX, "-").concat(NODE_ENV, "-").concat(THINGS_DB_TABLE_NAME_SUFFIX);
        case 'test':
            return "".concat(DB_TABLE_NAME_PREFIX, "-").concat(NODE_ENV, "-").concat(THINGS_DB_TABLE_NAME_SUFFIX);
        default:
            return "".concat(DB_TABLE_NAME_PREFIX, "-development-").concat(THINGS_DB_TABLE_NAME_SUFFIX);
    }
};
exports.getThingsDbName = getThingsDbName;
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
            case 1: 
            // @ts-ignore
            return [2 /*return*/, _b.apply(_a, [_c.sent(), translateConfig])];
        }
    });
}); };
exports.getDbDocumentClient = getDbDocumentClient;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
var consoleErrorOutput = function (value, err) {
    if (process.env.NODE_ENV !== 'test') {
        // eslint-disable-next-line no-console
        console.error("".concat(value, " db write error"), err);
    }
};
exports.consoleErrorOutput = consoleErrorOutput;
var queryByThingName = function (client, thingName) { return __awaiter(void 0, void 0, void 0, function () {
    var params, result;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                params = {
                    TableName: (0, exports.getThingsDbName)(),
                    IndexName: 'thingNameIndex',
                    KeyConditionExpression: 'thingName = :thingName',
                    ExpressionAttributeValues: { ':thingName': thingName }
                };
                return [4 /*yield*/, client.send(new lib_dynamodb_1.QueryCommand(params))];
            case 1:
                result = _b.sent();
                if ((_a = result.Items) === null || _a === void 0 ? void 0 : _a.length) {
                    return [2 /*return*/, { statusCode: 409, message: 'thing exists' }];
                }
                else {
                    return [2 /*return*/, { statusCode: 404, message: 'thing missing' }];
                }
                return [2 /*return*/];
        }
    });
}); };
exports.queryByThingName = queryByThingName;
