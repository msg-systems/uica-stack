var path = require("path");

module.exports = (function () {
    var protosObjectQuery = "//ObjectExpression //Property [ //Identifier [ @name == 'protos' ]]";
    var teardownMethodQuery = "//ObjectExpression //Property [ //Identifier [@name == 'teardown'] ]";
    var modelFieldCallerQuery = "//BlockStatement //ExpressionStatement //CallExpression [ /MemberExpression //Identifier [@name == 'value']]";

    var literalQuery = "/Literal";

    var createMethodQuery = "//ObjectExpression //Property [ //Identifier [@name == 'create'] ]";
    var modelFieldsQuery = "//ExpressionStatement //CallExpression [ //Identifier [ @name == 'model' ]] /ObjectExpression /Property [@kind == 'init']";
    var modelDefaultValueQuery = "//ObjectExpression //Property [ /Identifier [@name == 'value'] ]";

    var findTeardownModelFieldsInCtrl = function (tools, ctrlAstList) {
        var teardownModelFields = {};
        ctrlAstList.forEach(function (astObj) {
            var protos = tools.astJS.astq.query(astObj.ast, protosObjectQuery);
            var teardownMethods = tools.astJS.astq.query(protos[0], teardownMethodQuery);
            if (teardownMethods[0]) {
                var modelFields = tools.astJS.astq.query(teardownMethods[0], modelFieldCallerQuery);
                var componentPath = path.dirname(astObj.file);
                modelFields.forEach(function (modelField) {
                    if (modelField.arguments.length === 2) {
                        var modelName = modelField.arguments[0].value;
                        var value = modelField.arguments[1].type === "Literal" ? modelField.arguments[1].value : {};
                        if (!teardownModelFields[componentPath]) {
                            teardownModelFields[componentPath] = [{name: modelName, value: value, ast: modelField, file: astObj.file}]
                        } else {
                            teardownModelFields[componentPath].push({name: modelName, value: value, ast: modelField, file: astObj.file});
                        }

                    }
                });
            }
        });
        return teardownModelFields;
    };

    var findAllDefinedModelFields = function (tools, modelAstList) {
        var allModelFields = {};
        modelAstList.forEach(function (astObj) {
            var protos = tools.astJS.astq.query(astObj.ast, protosObjectQuery);
            var createMethods = tools.astJS.astq.query(protos[0], createMethodQuery);
            if (createMethods[0]) {
                var modelFields = tools.astJS.astq.query(createMethods[0], modelFieldsQuery);
                var componentPath = path.dirname(astObj.file);
                modelFields.forEach(function (method) {
                    var modelName = tools.astJS.astq.query(method, literalQuery);
                    var modelValue = tools.astJS.astq.query(method, modelDefaultValueQuery + "" + literalQuery);
                    var defaultValue = modelValue[0] ? modelValue[0].value : {};
                    if (!allModelFields[componentPath]) {
                        allModelFields[componentPath] = [{name: modelName[0].value, value: defaultValue}];
                    } else {
                        allModelFields[componentPath].push({name: modelName[0].value, value: defaultValue});
                    }

                });
            }
        });
        return allModelFields;
    };

    return function (options, tools) {
        var result = [];

        var ctrlAstList = tools.astJS.findAstList(options.root, options.ctrlFiles || "**/*ctrl.js", options.excludedFiles);
        var modelAstList = tools.astJS.findAstList(options.root, options.modelFiles || "**/*model.js", options.excludedFiles);

        var teardownModelFields = findTeardownModelFieldsInCtrl(tools, ctrlAstList);
        var modelFieldDefinitions = findAllDefinedModelFields(tools, modelAstList);

        for (var key in teardownModelFields) {
            if (teardownModelFields.hasOwnProperty(key)) {
                var modelFieldArray = teardownModelFields[key];
                if (!modelFieldDefinitions.hasOwnProperty(key)) {
                    modelFieldArray.forEach(function (field) {
                        result.push({file: field.file, text: "\n" + tools.astJS.astToString(field.ast)});
                    })

                } else {
                    modelFieldArray.forEach(function (field) {
                        var fieldFound = false;
                        modelFieldDefinitions[key].forEach(function (modelDef) {
                            if (modelDef.name === field.name) {
                                fieldFound = true;
                            }
                        });
                        if (!fieldFound) {
                            result.push({file: field.file, text: "\n" + tools.astJS.astToString(field.ast)});
                        }
                    })
                }
            }
        }

        return result;
    }

}());