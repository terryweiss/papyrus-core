module.exports = function ( grunt ) {
	grunt.loadNpmTasks( 'grunt-shell' );
	grunt.initConfig( {

		shell : {
			release1 : {
				command : [
					"touch Gruntfile.js",
					"git add .",
					'git commit -m "ready for release"'
				].join( ";" )

			},
			release2 : {
				command : ["npm version patch",
					"git push",
					"git push --tags",
					"npm publish"
				].join( "&&" )
			},
			docs:{
				command: "jsdoc -c jsdoc.conf.json"
			}
		}

	} );

	grunt.registerTask( 'release', ['shell:release1', 'shell:release2'] );
};
