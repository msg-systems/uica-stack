var glob = require("glob")
var path = require("path")
var _ = require("lodash")
require("colors")

module.exports = (function () {
    var observeOwnModelQuery = "//CallExpression [ /MemberExpression /Identifier [ @name == 'observeOwnModel' ]]"
    var modelFieldQuery = "//CallExpression [ /MemberExpression /Identifier [@name == 'model']]"
    var modelFieldNameQuery = "/ObjectExpression /Property /Literal"

    var checkModel = function (options, tools, filename, ast) {
        var findings = []
        var dirname = path.dirname(filename)
        var modelAstList = tools.astJS.findAstList(dirname, options.modelFiles || "*-model.js", options.excludedFiles)
        var modelFields = modelFieldsFromAstList(options, tools, modelAstList)

        var asts = tools.astJS.astq.query(ast, observeOwnModelQuery)
        asts.forEach(function (ast) {
            var observedField = ast.arguments[0].value;
            var regexp = /^(?:global:)?(?:state:|command:|param:|data:|event:).*$/;
            if (observedField) {
                var match = observedField.match(regexp);
                if (match && match.length === 1) {
                    if (!_.find(modelFields, function(modelFieldObj) {
                            return modelFieldObj.name === observedField
                        })) {
                        findings.push({
                            file: filename,
                            text: "model field ".gray + observedField.yellow.bold + " was not found in the components model file".gray
                        })
                    }
                } else {
                    findings.push({
                        file: filename,
                        text: "wrong model field name ".gray + observedField.yellow.bold
                    })
                }
            }
        })
        return findings
    }

    var modelFieldsFromAstList = function (options, tools, astList) {
        var modelFields = []
        astList.forEach(function (astObj) {
            var modelDefinitionAstList = tools.astJS.astq.query(astObj.ast, modelFieldQuery)
            modelDefinitionAstList.forEach(function (modelDefinitionAst) {
                var modelFieldsAstList = tools.astJS.astq.query(modelDefinitionAst, modelFieldNameQuery)
                modelFieldsAstList.forEach(function (modelFieldAst) {
                    modelFields.push({name: modelFieldAst.value, file: astObj.file})
                })
            })
        })
        return modelFields;
    }

    var fileIsNotExcluded = function (file, excludedFiles) {
        var result = true
        excludedFiles.forEach(function (eachFile) {
            if (path.join(eachFile) === path.join(file)) {
                result = false
            }
        })
        return result
    }

    return function (options, tools) {
        var findings = []

        var astList = tools.astJS.findAstList(options.root, options.includeFiles, options.excludedFiles)
        astList.forEach(function (astObj) {
            var filename = path.join(astObj.file)
            if (fileIsNotExcluded(filename, options.excludedFiles)) {
                findings = findings.concat(checkModel(options, tools, filename, astObj.ast))
            }
        })

        return findings
    }
}());