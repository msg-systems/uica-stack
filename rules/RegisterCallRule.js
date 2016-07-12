var traverse = require("ast-traverse");
var _ = require("lodash");

module.exports = (function () {

    var extractAllCallExpressionsWithName = function (astList, names, idx) {
        var result = {};
        astList.forEach(function (astObj) {
            var callExpressions = findAstExpressionWithName(astObj.ast, "CallExpression", names);
            callExpressions.forEach(function (callExpression) {
                var foundName = extractNameFromAstNode(callExpression.node.arguments[idx || 0]);
                if (foundName && foundName.match(/^["'].*['"]$/)) {
                    foundName = foundName.match(/^["'](.*)['"]$/)[1]
                    result[foundName] = { name: foundName, type: callExpression.name, file: astObj.file }
                }
            });
        });
        return result;
    };

    var extractAllEventNamesFromObjectExpressionsWithKey = function (astList, names) {
        var result = {};
        var objectExpressionsWithKey = extractAllObjectExpressionsWithKey(astList, names);
        objectExpressionsWithKey.forEach(function (objectExpression) {
            traverse(objectExpression.node, {pre: function (node, parent, prop, idx) {
                if (node.type === "Property") {
                    if (node.key.name === "event") {
                        var foundName = extractNameFromAstNode(node.value);
                        if (foundName && foundName.match(/^["'].*['"]$/)) {
                            result[foundName] = { name: foundName, type: objectExpression.name + ".event implicit triggering call", file: objectExpression.file };
                        }
                    }
                }
            }});
        });
        return result;
    };

    var extractAllObjectExpressionsWithKey = function (astList, names) {
        var result = [];
        var tmpNames;
        if (Object.prototype.toString.call(names) === Object.prototype.toString.call([])) {
            tmpNames = names;
        } else {
            tmpNames = [ names ];
        }
        tmpNames.forEach(function (name) {
            astList.forEach(function (astObj) {
                traverse(astObj.ast, {pre: function (node, parent, prop, idx) {
                    if (node.type === "ObjectExpression") {
                        node.properties.forEach(function (nodeProp) {
                            if (nodeProp.key && nodeProp.key.name === name) {
                                result.push({ file: astObj.file, name: name, node: node, parent: parent, prop: prop, idx: idx });
                            }
                        });
                    }
                }});
            });
        });
        return result;

    };

    var findAstExpressionWithName = function (ast, expression, names) {
        var result = [];
        var tmpNames;
        if (Object.prototype.toString.call(names) === Object.prototype.toString.call([])) {
            tmpNames = names;
        } else {
            tmpNames = [ names ];
        }
        tmpNames.forEach(function (name) {
            traverse(ast, {pre: function (node, parent, prop, idx) {
                if (node.type === expression) {
                    var callName = extractNameFromAstNode(node);
                    if (callName === name) {
                        result.push({ name: callName, node: node, parent: parent, prop: prop, idx: idx });
                    }
                }
            }});
        });
        return result;
    };

    var extractNameFromAstNode = function (node) {
        var result = "";
        switch (node.type) {
            case "Identifier":
                result = node.name;
                break;
            case "Literal":
                result = node.raw;
                break;
            case "MemberExpression":
                result = extractNameFromAstNode(node.property);
                break;
            case "CallExpression":
                result = extractNameFromAstNode(node.callee);
                break;
            case "FunctionExpression":
                // FunctionExpression has no name function(){}() == anonymous function call
                break;
            case "ObjectExpression":
                node.properties.forEach(function (arg) {
                    if (arg.key.type === "Identifier" && arg.key.name === "name")
                        result = extractNameFromAstNode(arg.value);
                });
                break;
            case "ArrayExpression":
                break;
            case "ArrowFunctionExpression":
                break;
            case "ThisExpression":
                break;
            default:
                console.log("Another node.type was found", JSON.stringify(node, 0, 1))
        }
        return result;
    };

    var patternMatch = function (test, patternArray) {
        var result = false;
        if (test) {
            _.forEach(patternArray, function(pattern) {
                if (test.match(pattern) !== null) {
                    result = true;
                }
            })
        }
        return result;
    };

    var filterExcludePatterns = function (list, excludePatterns) {
        var result = {};
        var patterns = [];
        if (excludePatterns && Array.isArray(excludePatterns)) {
            patterns = excludePatterns;
        } else if (excludePatterns) {
            patterns.push(excludePatterns);
        }
        for (var key in list) {
            if (!patternMatch(key, patterns)) {
                result[key] = list[key];
            }
        }
        return result;
    };

    var findAllMissingKeys = function (source, target) {
        var result = {};
        for (var key in source) {
            if (!target[key]) {
                result[key] = source[key];
            }
        }
        return result;
    };

    return function (options, tools) {
        var result = [];

        var astList = tools.astJS.findAstList(options.root, options.includeFiles, options.excludedFiles);
        var registerNames = _.assign(
            extractAllCallExpressionsWithName(astList, ["register", "registerAPI"], 0),
            extractAllCallExpressionsWithName(astList, ["registerService"], 1)
        );
        registerNames = filterExcludePatterns(registerNames, options.excludePatterns)

        var callNames = _.assign(
            extractAllCallExpressionsWithName(astList, ["call", "subscribeDataService"], 0),
            extractAllEventNamesFromObjectExpressionsWithKey(astList, ["navigationEntry"])
        );
        callNames = filterExcludePatterns(callNames, options.excludePatterns)
        
        var allMissingRegisterCalls = findAllMissingKeys(registerNames, callNames);
        for (var key in allMissingRegisterCalls) {
            var missingRegisterCall = allMissingRegisterCalls[key];
            result.push({ file: missingRegisterCall.file, text: missingRegisterCall.type + "(" + missingRegisterCall.name + ")"});
        }
        var allUndefinedCalls = findAllMissingKeys(callNames, registerNames);
        for (key in allUndefinedCalls) {
            var missingRegister = allUndefinedCalls[key];
            result.push({ file: missingRegister.file, text: missingRegister.type + "(" + missingRegister.name + ")"});
        }

        return result;
    }

}());