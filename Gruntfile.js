module.exports = function(grunt) {
    var path = require("path");

    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),
        jshint: {
            source: {
                src: "src/**/*.js",
                options: {
                    jshintrc: "src/.jshintrc",
                }
            },
            tests: {
                src: "src/tests/**/*.js",
            },
            grunt: {
                src: "Gruntfile.js"
            },
            dist: {
                src: ["<%=concat.dist.dest%>"],
                options: {
                    jshintrc: "src/.jshintrc",
                }
            }
        },
        jsonlint: {
            pkg: {
                src: "package.json"
            },
            bower: {
                src: "bower.json"
            }
        },
        concat: {
            dist: {
                src: "<%= jshint.source.src %>",
                dest: "dist/<%= pkg.name %>.js"
            }
        },
        uglify: {
            dist: {
                src: "<%= concat.dist.dest %>",
                dest: "dist/<%= pkg.name %>.min.js"
            }
        },
        karma: {
            test: {
                options: {
                    port: 9876,
                    files: [
                        {pattern: "bower_components/d3/d3.min.js", watched: false, served: true, included: true},
                        {pattern: "bower_components/underscore/underscore-min.js", watched: false, served: true, included: true},
                        {pattern: "src/**/*.js", watched: true, served: true, included: true},
                        {pattern: "specs/**/*spec.js", watched: true, served: true, included: true}
                    ],
                    exclude: [
                        "src/begin.js",
                        "src/zzz.js"
                    ],
                    basePath: "",
                    browsers: ["Chrome", "PhantomJS"],
                    frameworks: ['jasmine'],
                    reports: ["progress"],
                    autoWatch: true
                },
            }
        },
        express: {
            test: {
                options: {
                    port: 9000,
                    hostname: "0.0.0.0",
                    bases: [path.resolve("./")]
                }
            }
        },
        watch: {
            all: {
                files: ["<%= jshint.source.src %>", "test/**/*.js", "**/*.html"],
                options: {
                    livereload: true,
                },
                tasks: ["build"]
            },
            karma: {
                files: ["<%= jshint.source.src", "test/**/*.js"],
                tasks: ["karma:unit:run"]
            }
        },
        open: {
            all: {
                path: "http://localhost:<%= express.test.options.port %>"
            }
        },
    });

    grunt.loadNpmTasks("grunt-jsonlint");
    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-contrib-concat");
    grunt.loadNpmTasks("grunt-contrib-uglify");

    grunt.loadNpmTasks("grunt-karma");
    grunt.loadNpmTasks("grunt-express");
    grunt.loadNpmTasks("grunt-contrib-watch");
    grunt.loadNpmTasks("grunt-open");

    grunt.registerTask("build", ["jshint", "jsonlint", "concat", "uglify"]);
    grunt.registerTask("dev", ["express","open", "watch"]);
    grunt.registerTask("default", ["concat", "uglify"]);
};
