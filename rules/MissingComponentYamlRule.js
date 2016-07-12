var glob = require("glob")
var path = require("path")
var fs = require("fs")
var _ = require("lodash")

module.exports = (function () {

    return function (options /*, tools*/) {
        var findings = []
        var result = {}
        //search for all js files in the given folder
        var files = []
        var includeGlobs = options.includeFiles
        if (Object.prototype.toString.call(options.includeFiles) !== Object.prototype.toString.call([]))
            includeGlobs = [options.includeFiles]
        //search for all desired files in the given folder
        _.forEach(includeGlobs, function (globPattern) {
            files = files.concat(glob.sync(globPattern, {cwd: options.root}))
        })
        files.forEach(function (file) {
            var filename = path.join(options.root, file)
            var dirname = path.dirname(filename)
            try {
                fs.openSync(path.join(dirname, "component.yaml"), "r")
            } catch (e) {
                if (!result[dirname]) {
                    findings.push({file: dirname, text: "component.yaml missing"})
                    result[dirname] = "found"
                }
            }
        })
        return findings
    }

}())