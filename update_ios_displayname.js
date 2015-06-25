#!/usr/bin/env node
 
var fs = require('fs');
var path = require('path');

module.exports = function(context){
	
	var rootdir = context.opts.projectRoot;
	var ConfigParser = context.requireCordovaModule("cordova-lib/src/configparser/ConfigParser");
	var config = new ConfigParser(path.join(rootdir,"config.xml"));
	var projectName = config.name();
	var xmlHelper = context.requireCordovaModule("cordova-lib/src/util/xml-helpers");	

	function findCurrentBundleName(filename){
		var testXml = xmlHelper.parseElementtreeSync(filename);
		var pListKeys = testXml.findall('.//key');
		var pListStrings = testXml.findall('.//string');
		//console.log(pListStrings);
		for(var i=0;i<pListKeys.length;i++){
			if(pListKeys[i].text === "CFBundleDisplayName"){

				var bundleDisplayId = pListKeys[i]._id+1;
				
				for(var j=0; j<pListStrings.length;j++){
					if(pListStrings[j]._id == bundleDisplayId){
						console.log(pListStrings[j].text);
						return pListStrings[j].text;
					}
				}
			}
		}
	}

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
				var existingProjectName = findCurrentBundleName(fullfilename);
				var toReplace = '<string>' + existingProjectName +'</string>';
				var replacement = '<string>' + appName +'</string>';
				replace_string_in_file(fullfilename, toReplace,replacement);
			} else {
				console.log("could not find: "+fullfilename);
			}
		});
	}
	else{
		console.log('could not find rootdir');
	}
}