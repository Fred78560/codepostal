exports.action = function(data){ 

var reg="/"+data.cp+"(.+)/i" ; var rgxp = eval(reg) ; var temp = JarvisIA.reco.match(rgxp) ; console.log(temp)
var ville = temp[1].trim() ; console.log("on envoie : ",ville)
    ville1=ville.replace(/ /gi,'-').replace(/sur-/gi,'').replace(/les-/gi,'').replace(/le-/gi,'').replace(/la-/gi,'').replace(/l'-/gi,'').replace(/des-/gi,'').replace(/de-/gi,'').replace(/du-/gi,'').replace(/d'-/gi,'').replace(/sur-/gi,'').replace(/[à|â|ä]/g,"a").replace(/[é|è|ê|ë]/g,"e").replace(/[ï|î]/g,"i").replace(/[ö|ô]/g,"o").replace(/[ù|û|ü]/g,"u").replace(/ÿ/g,"y").replace(/œ/g,"oe").replace(/æ/g,"ae").replace(/ç/g,"c");
    console.log("Réécriture de la ville pour l'URL "+ville1)
var moment = require('moment');moment.locale('fr');

    console.log("Jarvis doit chercher le code postal de "+ville)
   
var fs = require("fs");
var path = require('path');
var filePath = __dirname + "/SaveCodepostal.json";
var file_content;

    file_content = fs.readFileSync(filePath, 'utf8');
    file_content = JSON.parse(file_content);

    if(typeof file_content[ville] != 'undefined' && file_content[ville] != "") {
        var infos = file_content[ville];
        console.log("Informations: " + infos);
        JarvisIASpeech(infos);
        return;

    } else {
         var url = 'http://code.postal.fr/code-postal-'+ville1+'.html';
        console.log('Url Request: ' + url);
        var request = require('request');
        var cheerio = require('cheerio');

        request({ 'uri': url}, function(error, response, html) {

            if (error || response.statusCode != 200) {
                JarvisIASpeech("La requête vers Google a échoué. Erreur " + response.statusCode );
                return;
            }
            var $ = cheerio.load(html);

                var codepostal = $('.content-main > h2:nth-child(1)').first().text().trim().replace(/Codes postaux des 22 régions de France métropolitaine:/gi,'Désolé, mais cette version de code ne prends pas en compte les code postaux des villages.'); 
            if(codepostal == "") { // Si la première version n'existe pas on teste l'autre
                var codepostal = $('.content-main > h2:nth-child(1)').first().text().trim().replace(/Codes postaux des 22 régions de France métropolitaine:/gi,'Désolé, mais cette version de code ne prends pas en compte les code postaux des villages.');
            }

            if(codepostal == "") {
                console.log("Impossible de récupérer le code postal de "+ville);
                JarvisIASpeech("Désolé, je n'ai pas réussi à trouver le code postal de "+ville);
            } else {
                file_content[ville] = codepostal;
                chaine = JSON.stringify(file_content, null, '\t');
                fs.writeFile(filePath, chaine, function (err) {
                    console.log("[ --- "+ville+" --- ] Code postal enregistrés");
                });

                console.log("Informations: " + codepostal);
                JarvisIASpeech(codepostal);
            }
            return;
        });
    }    
}