#!/usr/bin/env node
 
var fs = require('fs');
var path = require('path');
  
module.exports = function(context){
	
	var rootdir = context.opts.projectRoot;
	var ConfigParser = context.requireCordovaModule("cordova-lib/src/configparser/ConfigParser");
	var config = new ConfigParser(path.join(rootdir,"config.xml"));
	var projectName = config.name();
	
	function replace_string_in_file(filename, to_replace, replace_with) {
		var data = fs.readFileSync(filename, 'utf8');
		var indexfound = data.indexOf(to_replace);
		var result = data.replace(to_replace, replace_with);
		fs.writeFileSync(filename, result, 'utf8');
		console.log('changed name of ios display name to: ' + replace_with);
	}
	
	//check we have ios platform in project
	if(context.opts.platforms.indexOf('ios') < 0){
		console.log('ios platform not found - hook terminating');
		return;
	}
	
	//get the name from config.xml <preference name="DisplayName" value="Foo"/> node
	var appName = config.getPreference("DisplayName");
	if (!appName) {
		console.log('no ios display name specified in config.xml. Add <preference name="DisplayName" value="Foo"/> to specify a display name');
		return;
	}
	if (rootdir) {
			 
		
		var filestoreplace = [        
			// ios
			"platforms/ios/" + projectName + "/" + projectName + "-Info.plist",
		];
		filestoreplace.forEach(function(val, index, array) {
			var fullfilename = path.join(rootdir, val);
			if (fs.existsSync(fullfilename)) {
				replace_string_in_file(fullfilename, "${PRODUCT_NAME}",appName);
			} else {
				console.log("could not find: "+fullfilename);
			}
		});
	}
	else{
		console.log('could not find rootdir');
	}
}