"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMemberExpressionBaseIdentifier = exports.getTags = exports.getComments = exports.getCommentsAsString = exports.getTagsOfKind = exports.getParameterTParam = exports.noLeadingWhitespace = exports.getPreviousNode = void 0;
const ldoc = require("../ast/ldoc");
function getPreviousNode(chunk, node) {
    let previousNode;
    for (const statement of chunk.body) {
        if (statement === node) {
            return previousNode;
        }
        else {
            previousNode = statement;
        }
    }
}
exports.getPreviousNode = getPreviousNode;
function noLeadingWhitespace(strings, ...values) {
    const stringWithWhitespace = strings
        .map((formattedString, index) => {
        const value = values[index];
        return `${formattedString}${value || ""}`;
    })
        .join("");
    return stringWithWhitespace.replace(/^(\s*)/gm, "").replace(/\n$/g, "");
}
exports.noLeadingWhitespace = noLeadingWhitespace;
function getParameterTParam(parameter, availableTags) {
    const name = parameter.type === "Identifier" ? parameter.name : parameter.value;
    const tparams = availableTags.filter((currentTag) => currentTag.kind === "tparam" && currentTag.name === name);
    if (tparams.length === 1) {
        return tparams[0];
    }
    else {
        return tparams;
    }
}
exports.getParameterTParam = getParameterTParam;
function getTagsOfKind(kind, node, chunk) {
    return getTags(getComments(chunk, node)).filter((tag) => tag.kind === kind);
}
exports.getTagsOfKind = getTagsOfKind;
function getCommentsAsString(chunk, node) {
    return getComments(chunk, node)
        .map((comment) => comment.value)
        .join(" ");
}
exports.getCommentsAsString = getCommentsAsString;
function getComments(chunk, node) {
    const previousNode = getPreviousNode(chunk, node);
    const comments = [];
    for (const comment of chunk.comments) {
        const [nodeBegin] = node.range;
        const [commentBegin, commendEnd] = comment.range;
        const min = previousNode ? previousNode.range[1] : 0;
        if (commentBegin >= min && commendEnd <= nodeBegin) {
            comments.push(comment);
        }
    }
    return comments;
}
exports.getComments = getComments;
function getTags(comments) {
    const availableTags = [];
    comments.forEach((comment) => {
        const [, tagName, ...text] = comment.raw.split(" ");
        switch (tagName) {
            case "@param": {
                const [name, ...description] = text;
                availableTags.push(ldoc.createParamTag(name, description.join(" ")));
                break;
            }
            case "@tparam": {
                const [type, name, ...description] = text;
                availableTags.push(ldoc.createTParamTag(name, type, description.join(" ")));
                break;
            }
            case "@return": {
                const [...description] = text;
                availableTags.push(ldoc.createReturnTag(description.join(" ")));
                break;
            }
            case "@treturn": {
                const [type, ...description] = text;
                availableTags.push(ldoc.createTReturnTag(type, description.join(" ")));
                break;
            }
            case "@type": {
                const [type, ...description] = text;
                availableTags.push(ldoc.createTypeTag(type, description.join(" ")));
                break;
            }
            case "@classmod": {
                const [name] = text;
                availableTags.push(ldoc.createClassMod(name));
                break;
            }
            case "@module": {
                const [name] = text;
                availableTags.push(ldoc.createModuleTag(name));
                break;
            }
        }
    });
    return availableTags;
}
exports.getTags = getTags;
function getMemberExpressionBaseIdentifier(node) {
    let base = node.base;
    while (base.type === "MemberExpression") {
        base = base.base;
    }
    return base;
}
exports.getMemberExpressionBaseIdentifier = getMemberExpressionBaseIdentifier;
