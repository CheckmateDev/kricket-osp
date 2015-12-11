/*
*   router.js
*   Configuring router
*/

Router.configure({
    layoutTemplate: 'basic', //set default layout to basic
    yieldTemplates: {
        'templateBasicHeader': {to: 'templateBasicHeader'},
        'templateBasicFooter': {to: 'templateBasicFooter'},
    },
    notFoundTemplate: 'templatePublicNotFound',
    loadingTemplate: 'templatePublicLoading',
});

/* require login, if user logged in then call loading template else back to login page */

var requireLogin = function() {
    if (!Meteor.user()) {
        Meteor.loginVisitor();
        Router.go('map');
    }
    else
        this.next();
}

Router.onBeforeAction(requireLogin, {
    except: [
        'sitesIndex',
        'postsIndex',
        'postsView',
        'usersRegister',
        'usersLogin',
        'usersForgetPassword',
        'messageFile',
        'spriteFileSvg',
        'spriteFilePng',
        'enroll'
    ]
});