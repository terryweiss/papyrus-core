module.exports = function ( grunt ) {
	grunt.loadNpmTasks('grunt-shell');
	grunt.initConfig( {

		shell : {
			release : {
				command : [
					'git add .;git commit -m "ready for release";npm version patch',
					"git push",
					"git push --tags",
					"npm publish"
				].join("&&")
			}
		}

	} );

	grunt.registerTask( 'release', ['shell:release'] );
};
