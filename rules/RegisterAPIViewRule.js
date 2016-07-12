var _ = require("lodash")

module.exports = (function () {

    var findingInFilesByQuery = function (tools, root, filesPattern, query, excludedFiles) {
        var regexp = /markup/i
        var result = []
        tools.astJS.findAndLoopAstList(root, filesPattern, excludedFiles, function (ast, file) {
            var findings = tools.astJS.astq.query(ast, query)
            _.forEach(findings, function (finding) {
                var literal = tools.astJS.astq.query(finding, "/Literal")
                if (literal.length && literal[0].value.match(regexp) === null) {
                    result.push({file: file, text: "\n" + tools.astJS.astToString(finding)})
                }
            })
        })
        return result
    }

    return function (options, tools) {
        var registerViewQuery = "//CallExpression [ //MemberExpression //Identifier [ @name == 'registerAPI' ]]"
        var viewCallQuery = "//CallExpression [/MemberExpression [ /MemberExpression [/Identifier [ @name == 'view' ]] && /Identifier [ @name == 'call' ]]]"
        var result = findingInFilesByQuery(tools, options.root, options.viewFiles || "**/*-view.js", registerViewQuery, options.excludedFiles)
        result = result.concat(findingInFilesByQuery(tools, options.root, options.ctrlFiles || "**/*-ctrl.js", viewCallQuery, options.excludedFiles))
        return result
    }

}())
