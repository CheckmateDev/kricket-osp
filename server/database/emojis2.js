/*
*   emojis2.js
*   Generation of emojis sprites
*/

Meteor.startup(
  function () {

    // init stuff
    var myEmojis = new emojis();

    console.log("Version of Emojis : "+versionOfEmojis);
    if (EmojisUpdated.find({versionOfEmojis : versionOfEmojis }).fetch().length==1){
      console.log("Already in db, we don't have to update");
      return;
    }
    myEmojis.removeEmojis();
    currentPath = process.env.PWD;
    // By default, to avoid generation on server, we test if production mode is on
    if (process.env.NODE_ENV=="production"){
      myEmojis.loadEmojis(currentPath + '/.public/svg/sprites/');
      return true;
    }
    myEmojis.generateSprites(currentPath + '/.public/svg/tags/',currentPath + '/.public/svg/sprites/');
    EmojisUpdated.insert({versionOfEmojis : versionOfEmojis});
  }
);


// EMOJI sprite generation
// There will be emojis object that will be inserted in mongo too.
function emojis(){

  fs = Meteor.npmRequire('fs');
  path = Meteor.npmRequire('path');
  mkdirp = Meteor.npmRequire('mkdirp');

  this.sizeFactor = 1.5;

  this.applySizeFactor = function(cssContent){
    var content = cssContent;
    if (!cssContent.length)
      return "";
    widthReplace = "width: "+Math.round(47.5*this.sizeFactor)+"px";
    heightReplace = "height: "+Math.round(47.5*this.sizeFactor)+"px";
    content = content.replace(/width:\s47\.5px/g, widthReplace);
    content = content.replace(/height:\s47\.5px/g, heightReplace);
    return content;
  }

  this.generateSprites = function(inputEmojisFolderPath,outputSpritesPath){
    console.log("emojis.generateSprites");
    var SVGSpriter = Meteor.npmRequire("svg-sprite");
    
    // where we get all emojis to merge ?
    iconsFolderPath = inputEmojisFolderPath;
    // where are sprites stored ?
    outputIconsPath = outputSpritesPath;
    // get all folders in iconsFolderPath
    var iconsFolders = fs.readdirSync(iconsFolderPath).filter(function(file){
      return fs.statSync(path.join(iconsFolderPath,file)).isDirectory();
    });
    var emojiObjects = [];

    // Browse each icon folder, then generate for each a css file & svg sprite.
    for(var i=0;i<iconsFolders.length;i++){
      console.log("Emojis processing folder : "+iconsFolders[i]);
      var emojiObject = { category : iconsFolders[i], emojis : []};
      var emojiFilePath = path.join(iconsFolderPath,iconsFolders[i]);
      var outputIconsPathCategory = path.join(outputIconsPath,iconsFolders[i]);
      var data = fs.readdirSync(emojiFilePath);

      if (data.length!=0){

        // making configfile, using this tool below, much easier
        // http://jkphl.github.io/svg-sprite/#json
        var config = {
        "dest": outputIconsPathCategory,
        "mode": {
          "css": {
            "render" : {
              "css" : true
            }
          }
        },
        "shape":{
          "id":{
            "generator": "emoji-"+ iconsFolders[i] + "-"
          }
        }
        /*,"log":"verbose"*/
        };

        // initiate new SVGSpriter, it will combine all svgs
        var spriter = new SVGSpriter(config);
        for(var j=0;j<data.length;j++){
          spriter.add(path.join(emojiFilePath,data[j]), null, fs.readFileSync(path.join(emojiFilePath,data[j]), {encoding: 'utf-8'}));
          emojiObject.emojis.push(data[j].substring(0,data[j].length-4));
        }
        this._updateInDb(emojiObject);

        var self = this;

        // create every folders missing
        mkdirp.sync(outputIconsPathCategory);
        // Compile into sprite 
        spriter.compile(function(error, result) {
          // fd = fs.openSync(currentPath+ '/log.txt', 'w');
          // fs.writeSync(fd,JSON.stringify(result));
          // fs.closeSync(fd);
          if (error) throw error;

          // write svg file
          fs.writeFileSync(path.join(result.css.sprite.base,"sprite.svg"), result.css.sprite.contents,{flag:'w'});
          length = result.css.sprite.base.split("/").length;
          category = result.css.sprite.base.split("/")[length-1];
          pathPng = path.join(currentPath,".public/png/sprites/",category);
          mkdirp.sync(pathPng);
          fs.createReadStream(path.join(result.css.sprite.base,"sprite.svg")).pipe(fs.createWriteStream(path.join(pathPng,'sprite.svg')));
          self._createPng(pathPng);

          // write sprites.css
          var pathCss = path.join(result.css.sprite.base,"sprite.css");

          fs.writeFileSync(pathCss,result.css.css.contents,{flag:'w'});
          // open css path
          var result = fs.readFileSync(pathCss,{'encoding':'utf-8'});
          // replace url in css file via regex, like this url(svg/sprite.css-57805cfa.svg) with url(sprite.svg)
          var regex = /url\([^\)]*/g; 
          var subst = 'url(sprite\.svg?v='+(new Date()).getTime();
          result = result.replace(regex, subst);
          result = self.applySizeFactor(result);
          // open css file in write mode
          fd = fs.openSync(pathCss, 'w');
          // write results in it
          fs.writeSync(fd,result);
          fs.closeSync(fd);

          // copy css into png
          r = fs.createReadStream(pathCss).pipe(fs.createWriteStream(path.join(pathPng,'sprite.css')));
          r.on('finish',function(){
            //console.log("path png : "+path.join(pathPng,'sprite.css'));
            result = fs.readFileSync(path.join(pathPng,'sprite.css'),{'encoding':'utf-8'});
            // replace url in css file via regex, like this url(svg/sprite.css-57805cfa.svg) with url(sprite.svg)
            //console.log("before url : " + result);
            regex = /sprite\.svg\?/g; 
            subst = 'sprite\.png?';
            result = result.replace(regex, subst);
            regex = /\.svg-emoji/g;
            subst = '.png-emoji';
            result = result.replace(regex, subst);
            //console.log("result = "+ result);
            // open css file in write mode
            fd = fs.openSync(path.join(pathPng,'sprite.css'), 'w');
            // write results in it
            fs.writeSync(fd,result);
            fs.closeSync(fd);
          });
        });

        console.log("new category : "+ JSON.stringify(emojiObject));
        emojiObjects.push(emojiObject);
      }
      else{
        console.log("Not taking into account folder :" + iconsFolders[i] + " there is no emoji files in it !!");
      }
    }  

    if (emojiObjects.length!=0){
      // store emojiObjects, will be used by server only
      fs.writeFileSync(path.join(outputSpritesPath,"emojiObjects.json"), JSON.stringify(emojiObjects),{flag:'w'});
    }
  }

  this._updateInDb = function(emojiObject){
    // call update emoji in db..
    console.log("emojis._updateInDb");
    var cat = new categories();
    var categoryOrder = cat.getOrder(emojiObject.category);
    this.removeEmojisOfCategoryIfExist(emojiObject.category);
    for(var i=0;i<emojiObject.emojis.length;i++){
      Emojis2.insert({
        code:emojiObject.emojis[i],
        img:emojiObject.emojis[i]+".svg",
        category:emojiObject.category,
        order:i,
        categoryOrder:categoryOrder}
        );
    }
    console.log("Emojis updated in db for category : "+emojiObject.category);
  }

  this._createPng=function(myPath){
    var svg2png = Meteor.npmRequire('svg2png');    
    inFile = path.join(myPath,"sprite.svg");
    outFile = path.join(myPath,"sprite.png");
    svg2png(inFile,outFile,this.sizeFactor, function (err) {
      if (err)
        console.log("ERROR : " +JSON.stringify(err));
    });
  }

  this.removeEmojisOfCategoryIfExist=function(category){
    if (Emojis2.find({category:category}).fetch().length)
      Emojis2.remove({category:category});
  }

  this.removeEmojis = function(){
    console.log("emojis.removeEmojis");
    Emojis2.remove({});
  }

  this.loadEmojis = function(outputSpritesPath){
    console.log("emojis.loadEmojis");
    content = fs.readFileSync(path.join(outputSpritesPath,"emojiObjects.json"), {encoding: 'utf-8'});
    emojiObjects = JSON.parse(content);
    for(var i=0;i<emojiObjects.length;i++){
      this._updateInDb(emojiObjects[i]);
    }
  }

}
