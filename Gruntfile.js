module.exports = function (grunt) {

    grunt.initConfig({
        build: {
            options: {
                include: [ "address"
                         , "response"
                         , "ok"
                         , "error"
                         , "redirect"
                         , "created"
                         , "into"
                         , "http-status-code"
                         , "stream"
                         ],
                plugins: {
                  "text": '../node_modules/text/text'
                , "logger/log": 'empty:'
                }
            }
        },

        karma: {
            "ci-test": {
                configFile: "karma.conf.js",
                colors: false,
                singleRun: true,
                reporters: ["teamcity", "coverage"],
                coverageReporter: {
                  type: "teamcity"
                },
                browsers: ["Chrome"]
            }
        }
    });

    grunt.loadNpmTasks('zambezi-contrib-build');
    grunt.loadNpmTasks('grunt-karma');

    grunt.registerTask("default", ["build"]);
    grunt.registerTask("ci-build", ["build"]);
}
