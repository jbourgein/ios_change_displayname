#iOS Change Display Name Cordova Hook
This is a Cordova hook to allow the name that appears below the icon on iOS to be different from the bundle ID. 

##How it works
It changes the <project-name>-Info.plist file to use the specified name rather than the ${PROJECT_NAME} variable. 

##How to use it
Add the [update_ios_displayname.js](https://github.com/OmniIsg/ios_change_displayname/tree/master/update_ios_displayname.js) file to your Cordova project (in a scripts/ folder in the project root is a good place)

Add the following lines to the 'config.xml' file again in the project root replacing "Foo" with whatever you want to appear under the iOS icon.

'''
<preference name="DisplayName" value="Foo"/>
<hook type="after_prepare" src="scripts/update_ios_displayname.js" />
'''

Now when you run 'cordova prepare' the plist will be updated with your chosen display name.