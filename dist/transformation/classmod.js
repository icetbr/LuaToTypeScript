"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.canBeTransformedToClass = void 0;
const helper = require("./helper");
function canBeTransformedToClass(statements, chunk) {
    const [firstStatement] = statements;
    if (firstStatement && firstStatement.type === "LocalStatement") {
        const [tag] = helper.getTagsOfKind("classmod", firstStatement, chunk);
        if (tag) {
            return true;
        }
    }
    return false;
}
exports.canBeTransformedToClass = canBeTransformedToClass;
