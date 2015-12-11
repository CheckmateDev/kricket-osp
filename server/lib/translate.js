/*
*	translate.js
*	Translate a text into another language 	
* 	Need to register to get frengly account at http://frengly.com
*/

translate = function(sourceText,targetLang){
	var sourceLang = 'auto';
	var email = "xxxxxxxxx";	
	var password = "xxxxxxxxx";
	var url = "http://frengly.com?src=auto&dest="+encodeURI(targetLang)+"&text="+encodeURI(sourceText)+"&email="+email+"&password="+password+"&outformat=json";
	var result = HTTP.get(url);
	var translation = null;
	console.log("launch of translation");
	try{
		translation = JSON.parse(result.content).translation
	}catch(Exception){
		console.log("Exception during translation with frengly : "+result.content);
		translation = sourceText;
	}
	return translation;
}

atmosCommentHasTranslationForThisLanguage = function(comments,lang){
	if (!comments || !comments.translations)
		return false;

	for(var i=0;i<comments.translations.length;i++){
		var element = comments.translations[i];
		console.log("atmosComments : "+JSON.stringify(element));
		if (element.lang==lang)
			if (element.text!=null)
				return true;
			else
				return false;
	}
	return false;
}