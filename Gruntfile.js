// Generated on 2015-05-01 using
// generator-webapp 0.5.1
"use strict";

// # Globbing
// for performance reasons we"re only matching one level down:
// "test/spec/{,*/}*.js"
// If you want to recursively match all subfolders, use:
// "test/spec/**/*.js"

module.exports = function (grunt) {

  // Time how long tasks take. Can help when optimizing build times
  require("time-grunt")(grunt);

  // Load grunt tasks automatically
  require("load-grunt-tasks")(grunt);

  // Configurable paths
  var config = {
    app: "app",
    dist: "rfproject",
    spectrum: "rf-project-assets"
  };

  // Define the configuration for all the tasks
  grunt.initConfig({

    // Project settings
    config: config,

    // Watches files for changes and runs tasks based on the changed files
    watch: {
      bower: {
        files: ["bower.json"],
        tasks: ["wiredep"]
      },
      js: {
        files: ["<%= config.app %>/scripts/{,!(notused)/}*.js"],
        tasks: ["jshint"],
        options: {
          livereload: true
        }
      },
      jstest: {
        files: ["test/spec/{,*/,!notused/}*.js"],
        tasks: ["test:watch"]
      },
      gruntfile: {
        files: ["Gruntfile.js"]
      },
      sass: {
        files: ["<%= config.app %>/styles/{,*/}*.{scss,sass}"],
        tasks: ["sass:server", "autoprefixer"]
      },
      styles: {
        files: ["<%= config.app %>/styles/{,*/}*.css"],
        tasks: ["newer:copy:styles", "autoprefixer"]
      },
      livereload: {
        options: {
          livereload: "<%= connect.options.livereload %>"
        },
        files: [
          "<%= config.app %>/{,!(notused)/}*.html",
          ".tmp/styles/{,*/}*.css",
          "<%= config.app %>/images/{,*/}*"
        ]
      }
    },

    // The actual grunt server settings
    connect: {
      options: {
        port: 9000,
        open: true,
        livereload: 35729,
        // Change this to "0.0.0.0" to access the server from outside
        hostname: "localhost"
      },
      livereload: {
        options: {
          middleware: function(connect) {
            return [
              connect.static(".tmp"),
              connect().use("/bower_components", connect.static("./bower_components")),
              connect.static(config.app)
            ];
          }
        }
      },
      test: {
        options: {
          open: false,
          port: 9001,
          middleware: function(connect) {
            return [
              connect.static(".tmp"),
              connect.static("test"),
              connect().use("/bower_components", connect.static("./bower_components")),
              connect.static(config.app)
            ];
          }
        }
      },
      dist: {
        options: {
          base: "<%= config.dist %>",
          livereload: false
        }
      }
    },

    // Empties folders to start fresh
    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            ".tmp",
            "<%= config.dist %>/*",
            "!<%= config.dist %>/.git*"
          ]
        }]
      },
      spectrum: {
        files: [{
          dot: true,
          src: [
            ".tmp",
            "<%= config.spectrum %>/*"
          ]
        }]
      },
      server: ".tmp"
    },

    // Make sure code styles are up to par and there are no obvious mistakes
    jshint: {
      options: {
        jshintrc: ".jshintrc",
        reporter: require("jshint-stylish")
      },
      all: [
        "Gruntfile.js",
        "<%= config.app %>/scripts/{,!notused/}*.js",
        "!<%= config.app %>/scripts/vendor/*",
        "test/spec/{,*/}*.js"
      ]
    },

    // Mocha testing framework configuration options
    mocha: {
      all: {
        options: {
          run: true,
          urls: ["http://<%= connect.test.options.hostname %>:<%= connect.test.options.port %>/index.html"]
        }
      }
    },

    // Compiles Sass to CSS and generates necessary files if requested
    sass: {
      options: {
        sourceMap: true,
        includePaths: ["bower_components"]
        },
      dist: {
        files: [{
          expand: true,
          cwd: "<%= config.app %>/styles",
          src: ["*.{scss,sass}"],
          dest: ".tmp/styles",
          ext: ".css"
        }]
      },
      server: {
        files: [{
          expand: true,
          cwd: "<%= config.app %>/styles",
          src: ["*.{scss,sass}"],
          dest: ".tmp/styles",
          ext: ".css"
        }]
      }
    },

    // Add vendor prefixed styles
    autoprefixer: {
      options: {
        browsers: ["> 1%", "last 2 versions", "Firefox ESR", "Opera 12.1"],
        map: false
      },
      dist: {
        files: [{
          expand: true,
          cwd: ".tmp/styles/",
          src: "{,*/}*.css",
          dest: ".tmp/styles/"
        }]
      }
    },

    // Automatically inject Bower components into the HTML file
    wiredep: {
      app: {
        ignorePath: /^\/|\.\.\//,
        src: ["<%= config.app %>/*.html"]
      },
      sass: {
        src: ["<%= config.app %>/styles/{,*/}*.{scss,sass}"],
        ignorePath: /(\.\.\/){1,2}bower_components\//
      }
    },

    // Renames files for browser caching purposes
    rev: {
      dist: {
        files: {
          src: [
            "<%= config.dist %>/scripts/{,!(notused)/}*.js",
            "<%= config.dist %>/styles/{,*/}*.css",
            "<%= config.dist %>/images/{,*/}*.*",
            "<%= config.dist %>/styles/fonts/{,*/}*.*",
            "<%= config.dist %>/*.{ico,png}"
          ]
        }
      }
    },

    // Reads HTML for usemin blocks to enable smart builds that automatically
    // concat, minify and revision files. Creates configurations in memory so
    // additional tasks can operate on them
    useminPrepare: {
      options: {
        dest: "<%= config.dist %>"
      },
      html: "<%= config.app %>/*.html"
    },

    // Performs rewrites based on rev and the useminPrepare configuration
    usemin: {
      options: {
        assetsDirs: [
          "<%= config.dist %>",
          "<%= config.dist %>/images",
          "<%= config.dist %>/styles"
        ],
        patterns: {
          // FIXME While usemin won't have full support for revved files we have to put all references manually here
          js: [
              [/(images\/.*?\.(?:gif|jpeg|jpg|png|webp|svg))/gm, 'Update the JS to reference our revved images']
          ]
        }
      },
      html: ["<%= config.dist %>/*.html"],
      css: ["<%= config.dist %>/styles/{,*/}*.css"],
      js: ["<%= config.dist %>/scripts/*.js"]
    },

    // The following *-min tasks produce minified files in the dist folder
    imagemin: {
      dist: {
        files: [{
          expand: true,
          cwd: "<%= config.app %>/images",
          src: "{,*/}*.{gif,jpeg,jpg,png}",
          dest: "<%= config.dist %>/images"
        }]
      }
    },

    svgmin: {
      dist: {
        files: [{
          expand: true,
          cwd: "<%= config.app %>/images",
          // src: "{,*/}*.svg",
          src: ["*.svg","!gravestone-5.svg"],
          dest: "<%= config.dist %>/images"
        }]
      }
    },

    htmlmin: {
      dist: {
        options: {
          collapseBooleanAttributes: true,
          collapseWhitespace: true,
          conservativeCollapse: true,
          removeAttributeQuotes: true,
          removeCommentsFromCDATA: true,
          removeEmptyAttributes: true,
          removeOptionalTags: true,
          removeRedundantAttributes: true,
          useShortDoctype: true
        },
        files: [{
          expand: true,
          cwd: "<%= config.dist %>",
          src: "{,!(notused)/}*.html",
          dest: "<%= config.dist %>"
        }]
      }
    },

    // By default, your `index.html`"s <!-- Usemin block --> will take care
    // of minification. These next options are pre-configured if you do not
    // wish to use the Usemin blocks.
    // cssmin: {
    //   dist: {
    //     files: {
    //       "<%= config.dist %>/styles/main.css": [
    //         ".tmp/styles/{,*/}*.css",
    //         "<%= config.app %>/styles/{,*/}*.css"
    //       ]
    //     }
    //   }
    // },
    // uglify: {
    //   dist: {
    //     files: {
    //       "<%= config.dist %>/scripts/scripts.js": [
    //         "<%= config.dist %>/scripts/scripts.js"
    //       ]
    //     }
    //   }
    // },
    // concat: {
    //   dist: {}
    // },

    // Copies remaining files to places other tasks can use
    copy: {
      dist: {
        files: [{
          expand: true,
          dot: true,
          cwd: "<%= config.app %>",
          dest: "<%= config.dist %>",
          src: [
            "*.{ico,png,txt}",
            "images/{,*/}*.webp",
            "{,!(notused)/}*.html",
            "styles/fonts/{,*/}*.*",
            "data/{,*/}*.{json,csv}",
            "images/gravestone-5.svg"
          ]
        } 
        // ,{
        //   src: "node_modules/apache-server-configs/dist/.htaccess",
        //   dest: "<%= config.dist %>/.htaccess"
        // }a
        ]
      },
      spectrum : {
        files: [{
          expand: true,
          dot: true,
          cwd: "<%= config.dist %>",
          dest: "<%= config.spectrum %>",
          src: [
            "!(robots).{ico,png,txt}",
            "images/{,*/}*.*",
            "{,*/}!(parent)*.html",
            "styles/{,*/}*.*",
            "styles/fonts/{,*/}*.*",
            "scripts/{,*/}*.*",
            "data/{,*/}*.{json,csv}",
            "/../bower_components/pym.js/dist/pym.min.js"
          ]
        },
        {
          expand: true,
          dot: true,
          cwd: "",
          flatten: true,
          dest: "<%= config.spectrum %>",
          src: [
            "bower_components/pym.js/dist/pym.min.js"
          ]
        },
        {
          expand: true,
          dot: true,
          flatten: true,
          cwd: "<%= config.app %>",
          dest: "<%= config.spectrum %>",
          src: [
            "README.md"
          ]
        }
        ]
      },
      styles: {
        expand: true,
        dot: true,
        cwd: "<%= config.app %>/styles",
        dest: ".tmp/styles/",
        src: "{,*/}*.css"
      }
    },

    // Generates a custom Modernizr build that includes only the tests you
    // reference in your app
    modernizr: {
      dist: {
        devFile: "bower_components/modernizr/modernizr.js",
        outputFile: "<%= config.dist %>/scripts/vendor/modernizr.js",
        files: {
          src: [
            "<%= config.dist %>/scripts/{,!(notused)/}*.js",
            "<%= config.dist %>/styles/{,*/}*.css",
            "!<%= config.dist %>/scripts/vendor/*"
          ]
        },
        uglify: true
      }
    },

    rsync: {
      options: {
        args: ["--verbose"],
        exclude: [".git*","*.scss","node_modules"],
        recursive: true,
        ssh: true
      },
      prod: {
        options: {
          src: "<%= config.dist %>",
          dest: "joshromero.com",
          host: "joshuarrrr_shell@joshromero.com",
          delete: true // Careful this option could cause data loss, read the docs!
        }
      }
    },

    // Run some tasks in parallel to speed up build process
    concurrent: {
      server: [
        "sass:server",
        "copy:styles"
      ],
      test: [
        "copy:styles"
      ],
      dist: [
        "sass",
        "copy:styles",
        "imagemin",
        "svgmin"
      ]
    },

    compress: {
      spectrum: {
        options: {
          archive: "<%= config.spectrum %>.zip",
          mode: "zip"
        },
        files: [
          { src: "<%= config.spectrum %>/**" }
        ]
      }
    }
  });


  grunt.registerTask("serve", "start the server and preview your app, --allow-remote for remote access", function (target) {
    if (grunt.option("allow-remote")) {
      grunt.config.set("connect.options.hostname", "0.0.0.0");
    }
    if (target === "dist") {
      return grunt.task.run(["build", "connect:dist:keepalive"]);
    }

    grunt.task.run([
      "clean:server",
      "wiredep",
      "concurrent:server",
      "autoprefixer",
      "connect:livereload",
      "watch"
    ]);
  });

  grunt.registerTask("server", function (target) {
    grunt.log.warn("The `server` task has been deprecated. Use `grunt serve` to start a server.");
    grunt.task.run([target ? ("serve:" + target) : "serve"]);
  });

  grunt.registerTask("test", function (target) {
    if (target !== "watch") {
      grunt.task.run([
        "clean:server",
        "concurrent:test",
        "autoprefixer"
      ]);
    }

    grunt.task.run([
      "connect:test",
      "mocha"
    ]);
  });

  grunt.registerTask("build", [
    "clean:dist",
    "wiredep",
    "useminPrepare",
    "concurrent:dist",
    "autoprefixer",
    "concat",
    "cssmin",
    "uglify",
    "copy:dist",
    "modernizr",
    "rev",
    "usemin",
    "htmlmin",
    "clean:spectrum",
    "copy:spectrum",
    "compress:spectrum",
    "clean:spectrum"
  ]);

  grunt.registerTask("default", [
    "newer:jshint",
    "test",
    "build"
  ]);

  grunt.registerTask("deploy", [
    "rsync:prod"
  ]);
};
