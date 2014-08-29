module.exports = function(grunt){
    grunt.initConfig({
        yuidoc: {
            dist: {
                'name': 'Nyaplotjs',
                'description': "The javascript back-end for Nyaplot",
                'version': '0.1.0',
                options: {
                    paths: './',
                    outdir: 'docs/'
                }
            }
        },
        requirejs: {
            options: {
                baseUrl: 'src',
		        mainConfigFile: './src/config.js',
                name: '../contrib/almond/almond',
		        include: ['main'],
                wrap: {
                    startFile: 'src/wrap/start.js',
                    endFile: 'src/wrap/end.js'
                }
	        },
            production: {
                options: {
		            optimizeAllPluginResources: true,
		            optimize: 'uglify2',
		            out: "release/nyaplot.min.js"
		        }
	        },
            development: {
		        options: {
                    optimize: "none",
                    out: "release/nyaplot.js"
		        }
	        }
	    }
    });
    
    grunt.loadNpmTasks("grunt-contrib-requirejs");
    grunt.loadNpmTasks("grunt-contrib-yuidoc");
    grunt.registerTask("default", ["release"]);
    grunt.registerTask("debug", ["requirejs:development"]);
    grunt.registerTask("release", ["requirejs", "yuidoc"]);
};
