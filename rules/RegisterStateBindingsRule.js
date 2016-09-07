module.exports = (function () {
    var protosQuery = "//ObjectExpression //Property [ //Identifier [ @name == 'protos' ]] "
    var registerBindingsQuery = "/ObjectExpression //Property [ //Identifier [ @name == 'registerStateBindings' ]] " +
        "//CallExpression [ //MemberExpression //Identifier [ @name == 'observeParentModel' | @name == 'observeOwnModel' ] &&" +
        "/Literal [ @value !~ '^(global:state:|state:)' ]]"

    return function (options, tools) {
        var result = [];
        tools.astJS.findAndLoopAstList(options.root, options.viewFiles || "**/*-view.js", options.excludedFiles, function (ast, file) {
            var protos = tools.astJS.astq.query(ast, protosQuery);
            _.forEach(protos, function (proto) {
                result = result.concat(tools.astJS.findViolations(proto, file, registerBindingsQuery))
            })
        })
        return result;
    }

}());