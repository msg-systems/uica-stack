module.exports = (function () {
    var observeOwnModelQuery = "//CallExpression [ //MemberExpression //Identifier [ @name == 'observeOwnModel' ] &&" +
        "/Literal [ @value !~ '^(state:|command:|param:|data:|event:)' ]]"

    return function (options, tools) {
        var result = [];

        tools.astJS.findAndLoopAstList(options.root, options.includeFiles, options.excludedFiles, function (ast, file) {
            result = result.concat(tools.astJS.findViolations(ast, file, observeOwnModelQuery))
        })

        // Return the findings
        return result;
    }
}());