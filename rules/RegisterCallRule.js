var traverse = require("ast-traverse");
var _ = require("lodash");

module.exports = (function () {

    var reorderFindingsByNameAndFilter = function (findings, excludePatterns, idx) {
        var result = {};
        var patterns = [];
        if (excludePatterns && Array.isArray(excludePatterns)) {
            patterns = excludePatterns;
        } else if (excludePatterns) {
            patterns.push(excludePatterns);
        }
        var index = idx | 0
        findings.forEach(function (finding) {
            if (finding.finding && finding.finding.arguments && finding.finding.arguments[index]) {
                var name
                if (finding.finding.arguments[index].value) {
                    name = finding.finding.arguments[index].value
                }
                if (name && !patternMatch(name, patterns)) {
                    if (!result[name]) {
                        result[name] = []
                    }
                    result[name].push(finding)
                }
            }
        });
        return result
    }

    var patternMatch = function (test, patternArray) {
        var result = false;
        if (test) {
            _.forEach(patternArray, function (pattern) {
                if (test.match(pattern) !== null) {
                    result = true;
                }
            })
        }
        return result
    }

    var prepareQueryFindings = function (queryFindings, file, astJS) {
        var result = []
        queryFindings.forEach(function (finding) {
            result.push({
                file: file,
                finding: finding,
                text: "\n" + astJS.astToString(finding)
            })
        })
        return result
    }

    var findAllMissingKeys = function (source, target) {
        var result = []
        for (var key in source) {
            if (!target[key]) {
                result[key] = source[key]
            }
        }
        return result;
    }

    var mapObjectToArray = function (reorderedFindings) {
        var result = []
        for (var key in reorderedFindings) {
            var findings = reorderedFindings[key]
            findings.forEach(function (finding) {
                result.push(finding);
            })
        }
        return result
    }

    var nameQueryFromList = function (list) {
        var names = [];
        if (list && Array.isArray(list)) {
            names = list;
        } else if (list) {
            names.push(list);
        }
        var nameQuery = ""
        names.forEach(function (name) {
            if (nameQuery) {
                nameQuery += " | "
            }
            nameQuery += "@name == '" + name + "'"
        })
        return nameQuery
    }

    return function (options, tools) {
        var protosObjectQuery = "//ObjectExpression //Property [ //Identifier [ @name == 'protos' ]]"

        var registerList = options.registerQueries || ["register", "registerAPI"]
        var callList = options.callQueries || ["call", "subscribeDataService"]

        var registerQuery = "//CallExpression [ /MemberExpression //Identifier [ " + nameQueryFromList(registerList) + " ] ]"
        var callQuery = "//CallExpression [ /MemberExpression //Identifier [ " + nameQueryFromList(callList) + " ] ]"

        var secondArg = options.hasOwnProperty("registerSecondArgQueries")
        var registerServicesQuery = ""
        if (secondArg) {
            var registerSecondArgList = options.registerSecondArgQueries || ["registerService"]
            registerServicesQuery = "//CallExpression [ /MemberExpression //Identifier [ " + nameQueryFromList(registerSecondArgList) + " ] ]"
        }

        var astList = tools.astJS.findAstList(options.root, options.includeFiles, options.excludedFiles)

        var registerFindings = [], registerSecondArgFindings = [], callFindings = []

        astList.forEach(function (astObj) {
            try {
                var protos       = tools.astJS.astq.query(astObj.ast, protosObjectQuery)
                if (protos.length === 1) {
                    registerFindings = registerFindings.concat(prepareQueryFindings(tools.astJS.astq.query(protos[0], registerQuery), astObj.file, tools.astJS))
                    callFindings     = callFindings.concat(prepareQueryFindings(tools.astJS.astq.query(protos[0], callQuery), astObj.file, tools.astJS))
                    if (secondArg)
                        registerSecondArgFindings = registerSecondArgFindings.concat(prepareQueryFindings(tools.astJS.astq.query(protos[0], registerServicesQuery), astObj.file, tools.astJS))
                }
            } catch (e) {
                throw new Error('File ' + astObj.file + ' fails with: ' + e.message)
            }
        })

        var registers = reorderFindingsByNameAndFilter(registerFindings, options.excludePatterns)
        var calls = reorderFindingsByNameAndFilter(callFindings, options.excludePatterns)

        var result = mapObjectToArray(findAllMissingKeys(registers, calls))

        if (secondArg) {
            var registerSecondArgs = reorderFindingsByNameAndFilter(registerSecondArgFindings, options.excludePatterns, 1)
            result = result.concat(mapObjectToArray(findAllMissingKeys(registerSecondArgs, calls)))
        }

        // Return the remaining findings
        return result
    }

}());