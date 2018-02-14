var _ = require("lodash");

module.exports = (function () {

    var reorderFindingsByEventNameAndFilter = function (findings, excludePatterns) {
        var result = {};
        var patterns = [];
        if (excludePatterns && Array.isArray(excludePatterns)) {
            patterns = excludePatterns;
        } else if (excludePatterns) {
            patterns.push(excludePatterns);
        }
        findings.forEach(function (finding) {
            if (finding.finding && finding.finding.arguments && finding.finding.arguments[0]) {
                var eventName;
                if (finding.finding.arguments[0].value) {
                    eventName = finding.finding.arguments[0].value;
                }

                if (eventName && !patternMatch(eventName, patterns)) {
                    if (!result[eventName]) {
                        result[eventName] = []
                    }
                    result[eventName].push(finding);
                }
            }
        });
        return result;
    };

    var patternMatch = function (test, patternArray) {
        var result = false;
        if (test) {
            _.forEach(patternArray, function (pattern) {
                if (test.match(pattern) !== null) {
                    result = true;
                }
            })
        }
        return result;
    };

    var findAllMissingKeys = function (source, target) {
        var result = [];
        for (var key in source) {
            if (!target[key]) {
                result[key] = source[key];
            }
        }
        return result;
    };


    var mapObjectToArray = function (reorderedFindings) {
        var result = [];
        for (var key in reorderedFindings) {
            var findings = reorderedFindings[key];
            findings.forEach(function (finding) {
                result.push(finding);
            });
        }
        return result;
    };

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
        var protosObjectQuery = "//ObjectExpression //Property [ //Identifier [ @name == 'protos' ]]";

        var subscribeForChildList = options.subscribeForChildQueries || ["subscribeForChildEvent", "subscribeDataService"]
        var subscribeForParentList = options.subscribeForParentQueries || ["subscribeForParentEvent"]
        var publishToParentList = options.publishToParentQueries || ["publishEventToParent", "publishDataService"]
        var publishToChildrenList = options.publishToChildrenQueries || ["publishEventToChildren"]

        var subscribeForChildQuery = "//ExpressionStatement [ //MemberExpression //Identifier [ " + nameQueryFromList(subscribeForChildList) + " ] ] /CallExpression"
        var subscribeForParentQuery = "//ExpressionStatement [ //MemberExpression //Identifier [ " + nameQueryFromList(subscribeForParentList) + " ] ] /CallExpression"
        var publishEventToParentQuery = "//CallExpression [ /MemberExpression //Identifier [ " + nameQueryFromList(publishToParentList) + " ] ]"
        var publishEventToChildrenQuery = "//CallExpression [ /MemberExpression //Identifier [ " + nameQueryFromList(publishToChildrenList) + " ] ]"

        var astList = tools.astJS.findAstList(options.root, options.includeFiles, options.excludedFiles)

        var subscribeForChildEventFindings = [], subscribeForParentEventFindings = [], publishEventToParentFindings = [], publishEventToChildrenFindings = []

        astList.forEach(function (astObj) {
            var protos = tools.astJS.astq.query(astObj.ast, protosObjectQuery);
            subscribeForChildEventFindings = subscribeForChildEventFindings.concat(prepareQueryFindings(tools.astJS.astq.query(protos[0], subscribeForChildQuery), astObj.file, tools.astJS))
            subscribeForParentEventFindings = subscribeForParentEventFindings.concat(prepareQueryFindings(tools.astJS.astq.query(protos[0], subscribeForParentQuery), astObj.file, tools.astJS))
            publishEventToParentFindings = publishEventToParentFindings.concat(prepareQueryFindings(tools.astJS.astq.query(protos[0], publishEventToParentQuery), astObj.file, tools.astJS))
            publishEventToChildrenFindings = publishEventToChildrenFindings.concat(prepareQueryFindings(tools.astJS.astq.query(protos[0], publishEventToChildrenQuery), astObj.file, tools.astJS))
        })

        var subscribeForChildEvent = reorderFindingsByEventNameAndFilter(subscribeForChildEventFindings, options.excludePatterns)
        var subscribeForParentEvent = reorderFindingsByEventNameAndFilter(subscribeForParentEventFindings, options.excludePatterns)
        var publishEventToParent = reorderFindingsByEventNameAndFilter(publishEventToParentFindings, options.excludePatterns)
        var publishEventToChildren = reorderFindingsByEventNameAndFilter(publishEventToChildrenFindings, options.excludePatterns)

        var result = {}
        // Check whether a subscribeForChildEvent is never published
        result.unusedSubscribeForChildEvents = mapObjectToArray(findAllMissingKeys(subscribeForChildEvent, publishEventToParent))

        // Check whether a publishEventToParent is never subscribed
        result.unusedPublishEventsToParent = mapObjectToArray(findAllMissingKeys(publishEventToParent, subscribeForChildEvent))

        // Check whether a subscribeForParentEvent is never published
        result.unusedSubscribeForParentEvent = mapObjectToArray(findAllMissingKeys(subscribeForParentEvent, publishEventToChildren))

        // Check whether a publishEventToChildren is never subscribed
        result.unusedPublishEventsToChildren = mapObjectToArray(findAllMissingKeys(publishEventToChildren, subscribeForParentEvent))

        // Return the remaining findings
        return result
    }

}());