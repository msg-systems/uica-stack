module.exports = (function () {
    var registerBindingsQuery = "/ObjectExpression //Property [ //Identifier [ @name == 'registerStateBindings' ]] " +
        "//CallExpression [ //MemberExpression //Identifier [ @name == 'observeParentModel' | @name == 'observeOwnModel' ] &&" +
        "/Literal [ @value !~ '^(global:state:|state:)' ]]"

    return function (options, tools) {
        var result = [];
        tools.astJS.findAndLoopAstList(options.root, options.viewFiles || "**/*-view.js", options.excludedFiles, function (ast, file) {
            result = result.concat(tools.astJS.findViolations(ast, file, registerBindingsQuery))
        })
        return result;
    }

}());