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
var mocha_1 = require("mocha");
var sinon = require("sinon");
var chai_1 = require("chai");
var uuid_1 = require("uuid");
var createThingLambda = require("../lambda-create/index");
var readThingLambda = require("../lambda-read/index");
var appHelper_1 = require("./helper/appHelper");
var thingHelper_1 = require("./helper/thingHelper");
(0, mocha_1.describe)('thing tests', function () {
    var _this = this;
    var client;
    var thingName;
    var thingType;
    (0, mocha_1.before)(function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, appHelper_1.getDbDocumentClient)()];
                    case 1:
                        client = _a.sent();
                        thingName = 'thingOne';
                        thingType = (0, uuid_1.v4)();
                        return [4 /*yield*/, (0, thingHelper_1.createTable)(client)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    });
    (0, mocha_1.after)(function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, thingHelper_1.dropTable)(client)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    });
    (0, mocha_1.it)('read things', function () { return __awaiter(_this, void 0, void 0, function () {
        var thingTypeTwo, createdThingBody, thingId, qsParams, body, expectedResult, event, context, lambdaSpy, lambdaSpyResult;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    thingTypeTwo = (0, uuid_1.v4)();
                    return [4 /*yield*/, (0, appHelper_1.createThing)(client, 'thingTwoB', thingTypeTwo)];
                case 1:
                    createdThingBody = (_a.sent()).body;
                    thingId = (createdThingBody === null || createdThingBody === void 0 ? void 0 : createdThingBody.id) || '';
                    qsParams = {};
                    body = JSON.stringify([
                        {
                            id: thingId,
                            thingName: 'thingTwoB',
                            thingType: thingTypeTwo,
                            description: 'thingTwoB'
                        },
                    ]);
                    expectedResult = {
                        statusCode: 200,
                        message: 'ok',
                        body: body
                    };
                    event = (0, appHelper_1.createEventWrapper)(null, 'GET', qsParams);
                    context = (0, appHelper_1.createContext)('read-thing-test-lambda');
                    lambdaSpy = sinon.spy(
                    // @ts-ignore
                    readThingLambda.handler);
                    return [4 /*yield*/, lambdaSpy(event, context)];
                case 2:
                    lambdaSpyResult = _a.sent();
                    (0, chai_1.assert)(lambdaSpy.withArgs(event, context).calledOnce);
                    (0, thingHelper_1.assertThingsResponse)(lambdaSpyResult, expectedResult);
                    return [2 /*return*/];
            }
        });
    }); });
    (0, mocha_1.it)('create thing', function () { return __awaiter(_this, void 0, void 0, function () {
        var body, expectedResult, event, context, lambdaSpy, lambdaSpyResult;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    body = JSON.stringify({ thingName: thingName, thingType: thingType, description: thingName });
                    expectedResult = {
                        statusCode: 200,
                        message: 'ok',
                        body: body
                    };
                    event = (0, appHelper_1.createEventWrapper)(body, 'POST', {});
                    context = (0, appHelper_1.createContext)('create-thing-test-lambda');
                    lambdaSpy = sinon.spy(
                    // @ts-ignore
                    createThingLambda.handler);
                    return [4 /*yield*/, lambdaSpy(event, context)];
                case 1:
                    lambdaSpyResult = _a.sent();
                    (0, chai_1.assert)(lambdaSpy.withArgs(event, context).calledOnce);
                    (0, thingHelper_1.assertThingResponse)(lambdaSpyResult, expectedResult);
                    return [2 /*return*/];
            }
        });
    }); });
    (0, mocha_1.it)('create existing thing', function () { return __awaiter(_this, void 0, void 0, function () {
        var body, event, context, lambdaSpy, lambdaSpyResult;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    body = JSON.stringify({ thingName: thingName, thingType: thingType, description: thingName });
                    event = (0, appHelper_1.createEventWrapper)(body, 'POST', {});
                    context = (0, appHelper_1.createContext)('create-thing-test-lambda');
                    lambdaSpy = sinon.spy(
                    // @ts-ignore
                    createThingLambda.handler);
                    return [4 /*yield*/, lambdaSpy(event, context)];
                case 1:
                    lambdaSpyResult = _a.sent();
                    (0, chai_1.assert)(lambdaSpy.withArgs(event, context).calledOnce);
                    (0, thingHelper_1.assertResponseError)(lambdaSpyResult, 409, 'thing exists');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, mocha_1.it)('create bad thing', function () { return __awaiter(_this, void 0, void 0, function () {
        var body, event, context, lambdaSpy, lambdaSpyResult;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    body = JSON.stringify({ thingName: 'thingOne', thingType: '', description: '' });
                    event = (0, appHelper_1.createEventWrapper)(body, 'POST', {});
                    context = (0, appHelper_1.createContext)('create-thing-test-lambda');
                    lambdaSpy = sinon.spy(
                    // @ts-ignore
                    createThingLambda.handler);
                    return [4 /*yield*/, lambdaSpy(event, context)];
                case 1:
                    lambdaSpyResult = _a.sent();
                    (0, chai_1.assert)(lambdaSpy.withArgs(event, context).calledOnce);
                    (0, thingHelper_1.assertResponseError)(lambdaSpyResult, 400, 'invalid thing');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, mocha_1.it)('read thing by id', function () { return __awaiter(_this, void 0, void 0, function () {
        var thingTypeTwo, createdThingBody, thingId, qsParams, body, expectedResult, event, context, lambdaSpy, lambdaSpyResult;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    thingTypeTwo = (0, uuid_1.v4)();
                    return [4 /*yield*/, (0, appHelper_1.createThing)(client, 'thingTwo', thingTypeTwo)];
                case 1:
                    createdThingBody = (_a.sent()).body;
                    thingId = (createdThingBody === null || createdThingBody === void 0 ? void 0 : createdThingBody.id) || '';
                    qsParams = { id: thingId };
                    body = JSON.stringify([
                        {
                            id: thingId,
                            thingName: 'thingTwo',
                            thingType: thingTypeTwo,
                            description: 'thingTwo'
                        },
                    ]);
                    expectedResult = {
                        statusCode: 200,
                        message: 'ok',
                        body: body
                    };
                    event = (0, appHelper_1.createEventWrapper)(null, 'GET', qsParams);
                    context = (0, appHelper_1.createContext)('read-thing-test-lambda');
                    lambdaSpy = sinon.spy(
                    // @ts-ignore
                    readThingLambda.handler);
                    return [4 /*yield*/, lambdaSpy(event, context)];
                case 2:
                    lambdaSpyResult = _a.sent();
                    (0, chai_1.assert)(lambdaSpy.withArgs(event, context).calledOnce);
                    (0, thingHelper_1.assertThingsResponse)(lambdaSpyResult, expectedResult);
                    return [2 /*return*/];
            }
        });
    }); });
    (0, mocha_1.it)('read missing thing by id', function () { return __awaiter(_this, void 0, void 0, function () {
        var thingId, qsParams, event, context, lambdaSpy, lambdaSpyResult;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    thingId = '43961f67-fcfe-4515-8b5d-f59ccca6c041';
                    qsParams = { id: thingId };
                    event = (0, appHelper_1.createEventWrapper)(null, 'GET', qsParams);
                    context = (0, appHelper_1.createContext)('read-thing-test-lambda');
                    lambdaSpy = sinon.spy(
                    // @ts-ignore
                    readThingLambda.handler);
                    return [4 /*yield*/, lambdaSpy(event, context)];
                case 1:
                    lambdaSpyResult = _a.sent();
                    (0, chai_1.assert)(lambdaSpy.withArgs(event, context).calledOnce);
                    (0, thingHelper_1.assertResponseError)(lambdaSpyResult, 404, 'missing thing');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, mocha_1.it)('read thing by name', function () { return __awaiter(_this, void 0, void 0, function () {
        var thingTypeTwo, createdThingBody, thingId, qsParams, body, expectedResult, event, context, lambdaSpy, lambdaSpyResult;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    thingTypeTwo = (0, uuid_1.v4)();
                    return [4 /*yield*/, (0, appHelper_1.createThing)(client, 'thingThree', thingTypeTwo)];
                case 1:
                    createdThingBody = (_a.sent()).body;
                    thingId = (createdThingBody === null || createdThingBody === void 0 ? void 0 : createdThingBody.id) || '';
                    qsParams = { thingName: 'thingThree' };
                    body = JSON.stringify([
                        {
                            id: thingId,
                            thingName: 'thingThree',
                            thingType: thingTypeTwo,
                            description: 'thingThree'
                        },
                    ]);
                    expectedResult = {
                        statusCode: 200,
                        message: 'ok',
                        body: body
                    };
                    event = (0, appHelper_1.createEventWrapper)(null, 'GET', qsParams);
                    context = (0, appHelper_1.createContext)('read-thing-test-lambda');
                    lambdaSpy = sinon.spy(
                    // @ts-ignore
                    readThingLambda.handler);
                    return [4 /*yield*/, lambdaSpy(event, context)];
                case 2:
                    lambdaSpyResult = _a.sent();
                    (0, chai_1.assert)(lambdaSpy.withArgs(event, context).calledOnce);
                    (0, thingHelper_1.assertThingsResponse)(lambdaSpyResult, expectedResult);
                    return [2 /*return*/];
            }
        });
    }); });
    (0, mocha_1.it)('read missing thing by name', function () { return __awaiter(_this, void 0, void 0, function () {
        var qsParams, event, context, lambdaSpy, lambdaSpyResult;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    qsParams = { thingName: 'thingZero' };
                    event = (0, appHelper_1.createEventWrapper)(null, 'GET', qsParams);
                    context = (0, appHelper_1.createContext)('read-thing-test-lambda');
                    lambdaSpy = sinon.spy(
                    // @ts-ignore
                    readThingLambda.handler);
                    return [4 /*yield*/, lambdaSpy(event, context)];
                case 1:
                    lambdaSpyResult = _a.sent();
                    (0, chai_1.assert)(lambdaSpy.withArgs(event, context).calledOnce);
                    (0, thingHelper_1.assertResponseError)(lambdaSpyResult, 404, 'missing thing');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, mocha_1.it)('read thing by type', function () { return __awaiter(_this, void 0, void 0, function () {
        var thingTypeTwo, createdThingBody, thingId, qsParams, body, expectedResult, event, context, lambdaSpy, lambdaSpyResult;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    thingTypeTwo = (0, uuid_1.v4)();
                    return [4 /*yield*/, (0, appHelper_1.createThing)(client, thingName, thingTypeTwo)];
                case 1:
                    createdThingBody = (_a.sent()).body;
                    thingId = (createdThingBody === null || createdThingBody === void 0 ? void 0 : createdThingBody.id) || '';
                    qsParams = { thingType: thingTypeTwo };
                    body = JSON.stringify([
                        {
                            id: thingId,
                            thingName: thingName,
                            thingType: thingTypeTwo,
                            description: 'thingOne'
                        },
                    ]);
                    expectedResult = {
                        statusCode: 200,
                        message: 'ok',
                        body: body
                    };
                    event = (0, appHelper_1.createEventWrapper)(null, 'GET', qsParams);
                    context = (0, appHelper_1.createContext)('read-thing-test-lambda');
                    lambdaSpy = sinon.spy(
                    // @ts-ignore
                    readThingLambda.handler);
                    return [4 /*yield*/, lambdaSpy(event, context)];
                case 2:
                    lambdaSpyResult = _a.sent();
                    (0, chai_1.assert)(lambdaSpy.withArgs(event, context).calledOnce);
                    (0, thingHelper_1.assertThingsResponse)(lambdaSpyResult, expectedResult);
                    return [2 /*return*/];
            }
        });
    }); });
    (0, mocha_1.it)('read missing thing by type', function () { return __awaiter(_this, void 0, void 0, function () {
        var qsParams, event, context, lambdaSpy, lambdaSpyResult;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    qsParams = { thingType: 'thingTypeZero' };
                    event = (0, appHelper_1.createEventWrapper)(null, 'GET', qsParams);
                    context = (0, appHelper_1.createContext)('read-thing-test-lambda');
                    lambdaSpy = sinon.spy(
                    // @ts-ignore
                    readThingLambda.handler);
                    return [4 /*yield*/, lambdaSpy(event, context)];
                case 1:
                    lambdaSpyResult = _a.sent();
                    (0, chai_1.assert)(lambdaSpy.withArgs(event, context).calledOnce);
                    (0, thingHelper_1.assertResponseError)(lambdaSpyResult, 404, 'missing thing');
                    return [2 /*return*/];
            }
        });
    }); });
});
