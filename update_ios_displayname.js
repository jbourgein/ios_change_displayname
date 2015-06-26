#!/usr/bin/env node
 
var fs = require('fs');
var path = require('path');

function log(message){
	console.log(' > update_ios_display hook: ' + message);
}

module.exports = function(context){
	
	var rootdir = context.opts.projectRoot;
	var ConfigParser = context.requireCordovaModule("cordova-lib/src/configparser/ConfigParser");
	var config = new ConfigParser(path.join(rootdir,"config.xml"));
	var projectName = config.name();
	var xmlHelper = context.requireCordovaModule("cordova-lib/src/util/xml-helpers");	

	/*
	* this method presumes the plist has a <key> tag with the value CFBundleDisplayName and the
	* next tag is a <string> with the value of the name to display under the icon
	*/
	function findCurrentBundleName(filename){
		var testXml = xmlHelper.parseElementtreeSync(filename);
		var pListKeys = testXml.findall('.//key');
		var pListStrings = testXml.findall('.//string');
		for(var i=0;i<pListKeys.length;i++){
			if(pListKeys[i].text === "CFBundleDisplayName"){

				var bundleDisplayId = pListKeys[i]._id+1;
				
				for(var j=0; j<pListStrings.length;j++){
					if(pListStrings[j]._id == bundleDisplayId){						
						return pListStrings[j].text;
					}
				}
			}			
		}
	}

	/*
	* this method only replaces the first instance found so we are presuming that the first instance of
	* <string>display name</string> is the one we care about. 
	* If cordova/apple ever change the order of the plist
	* this will need rewriting
	*/
	function replace_string_in_file(filename, to_replace, replace_with) {

		var data = fs.readFileSync(filename, 'utf8');
		var indexfound = data.indexOf(to_replace);
		var result = data.replace(to_replace, replace_with);
		fs.writeFileSync(filename, result, 'utf8');
		log('changed name of ios display name from: ' + to_replace + ' to: ' + replace_with);
			
	}
	
	//check we have ios platform in project
	if(context.opts.platforms.indexOf('ios') < 0){
		return;
	}
	
	//get the name from config.xml <preference name="DisplayName" value="Foo"/> node
	var appName = config.getPreference("DisplayName");
	if (!appName) {
		log('no ios display name specified in config.xml. Add <preference name="DisplayName" value="Foo"/> to specify a display name');
		return;
	}
	if (rootdir) {
			 
		//leaving as array in case ever add some Android apk renaming	 
		var filestoreplace = [        
			"platforms/ios/" + projectName + "/" + projectName + "-Info.plist",
		];

		filestoreplace.forEach(function(val, index, array) {
			var fullfilename = path.join(rootdir, val);
			if (fs.existsSync(fullfilename)) {
				var existingProjectName = findCurrentBundleName(fullfilename);
				var toReplace = '<string>' + existingProjectName +'</string>';
				var replacement = '<string>' + appName +'</string>';
				if(toReplace !== replacement){
					replace_string_in_file(fullfilename, toReplace,replacement);
				}
				else{
					log('app display name already ' + appName + ' - nothing changed');
				}
			} else {
				log("could not find: "+fullfilename);
			}
		});
	}
	else{
		log('could not find rootdir');
	}
}