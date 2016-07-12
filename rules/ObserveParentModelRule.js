module.exports = (function () {
    var observeParentModelQuery = "//CallExpression [ //MemberExpression //Identifier [ @name == 'observeParentModel' ] &&" +
        "/Literal [ @value !~ '^(global:state:|global:command:|global:param:|global:data:|global:event:)' ]]"

    return function (options, tools) {
        var result = [];

        tools.astJS.findAndLoopAstList(options.root, options.includeFiles, options.excludedFiles, function (ast, file) {
            result = result.concat(tools.astJS.findViolations(ast, file, observeParentModelQuery))
        })

        // Return the findings
        return result;
    }
}());