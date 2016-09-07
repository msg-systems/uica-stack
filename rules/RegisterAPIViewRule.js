var _ = require("lodash")

module.exports = (function () {
    var protosQuery = "//ObjectExpression //Property [ //Identifier [ @name == 'protos' ]] "
    var registerViewQuery = "//CallExpression [ //MemberExpression //Identifier [ @name == 'registerAPI' ]]"
    var viewCallQuery = "//CallExpression [/MemberExpression [ /MemberExpression [/Identifier [ @name == 'view' ]] && /Identifier [ @name == 'call' ]]]"

    var findingInFilesByQuery = function (tools, root, filesPattern, query, excludedFiles) {
        var regexp = /markup/i
        var result = []
        tools.astJS.findAndLoopAstList(root, filesPattern, excludedFiles, function (ast, file) {
            var protos = tools.astJS.astq.query(ast, protosQuery);
            _.forEach(protos, function (proto) {
                var findings = tools.astJS.astq.query(proto, query)
                _.forEach(findings, function (finding) {
                    var literal = tools.astJS.astq.query(finding, "/Literal")
                    if (literal.length && literal[0].value.match(regexp) === null) {
                        result.push({file: file, text: "\n" + tools.astJS.astToString(finding)})
                    }
                })
            })
        })
        return result
    }

    return function (options, tools) {
        var result = findingInFilesByQuery(tools, options.root, options.viewFiles || "**/*-view.js", registerViewQuery, options.excludedFiles)
        result = result.concat(findingInFilesByQuery(tools, options.root, options.ctrlFiles || "**/*-ctrl.js", viewCallQuery, options.excludedFiles))
        return result
    }

}())
