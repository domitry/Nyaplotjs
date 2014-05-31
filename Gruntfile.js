module.exports = function(grunt){
    grunt.initConfig({
        requirejs: {
            options: {
                baseUrl: 'src',
		mainConfigFile: './src/config.js',
                name: '../lib/almond/almond',
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
		    out: "release/ecoli.min.js"
		}
	    },
            development: {
		options: {
                    optimize: "none",
                    out: "release/ecoli.js"
		}
	    }
	}
    });
    
    grunt.loadNpmTasks("grunt-contrib-requirejs")
    grunt.registerTask("default", ["release"])
    grunt.registerTask("deploy", ["requirejs"])
    grunt.registerTask("release", ["deploy"])
};
