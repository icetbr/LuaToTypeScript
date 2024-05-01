"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createModuleTag = exports.createClassMod = exports.createTypeTag = exports.createTReturnTag = exports.createReturnTag = exports.createTParamTag = exports.createParamTag = void 0;
function createParamTag(name, description) {
    return {
        description,
        kind: "param",
        name,
    };
}
exports.createParamTag = createParamTag;
function createTParamTag(name, type, description) {
    return {
        description,
        kind: "tparam",
        name,
        type,
    };
}
exports.createTParamTag = createTParamTag;
function createReturnTag(description) {
    return {
        description,
        kind: "return",
    };
}
exports.createReturnTag = createReturnTag;
function createTReturnTag(type, description) {
    return {
        description,
        kind: "treturn",
        type,
    };
}
exports.createTReturnTag = createTReturnTag;
function createTypeTag(type, description) {
    return {
        description,
        kind: "type",
        type,
    };
}
exports.createTypeTag = createTypeTag;
function createClassMod(name) {
    return {
        kind: "classmod",
        name,
    };
}
exports.createClassMod = createClassMod;
function createModuleTag(name) {
    return {
        kind: "module",
        name,
    };
}
exports.createModuleTag = createModuleTag;
