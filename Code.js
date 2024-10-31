// based on https://stackoverflow.com/questions/69803801/general-google-apps-script-to-display-data-from-a-google-sheet-in-a-datatable

function doGet() {
  return HtmlService
         .createTemplateFromFile('Index')
         .evaluate()
         .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
 
function getData(){ // Get data from Google sheet and return as an array
  var spreadsheetId = "2PACX-1vTgoSMjFWNxfgtVOampc3_v5selsFAgiNdCnnH7jEZGkKKg-yyRmKxs8rTl6WBRFvUPhsMBLtS4aaA-"
  var dataRange = 'A2:U';
  var range = Sheets.Spreadsheets.Values.get(spreadsheetId,dataRange);
  var values = range.values; 
  return values;
}
 
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename)
         .getContent();
}

function processForm(formObject){
  //Logger.log( "function processForm")  
  var result = "";
  //Logger.log("formObject = %s",formObject)
  if(formObject=="None"){
      criteria_list = [, , , , , , , , , , , , , , , , , , ]
  } else {
    criteria_list = [formObject.journal, formObject.annee, formObject.but, formObject.sujet, formObject.structure, formObject.forme, formObject.type, formObject.analyse, formObject.visualisation, formObject.medias, formObject.tutoriel, formObject.dlu, formObject.sequence, formObject.transitions, formObject.progression, formObject.interactions, formObject.schemas_argumentatifs, formObject.schemas_cadrage, formObject.schemas_engagement_empathie]
  }
  //Logger.log("unchecked criteria_list = %s",criteria_list)
  // replacing null from empty checkboxes by empty string, based on https://www.tutorialsandyou.com/javascript/javascript-array-replace-null-with-empty-string-192.html
  criteria_list = criteria_list.map(element => {
    //Logger.log("element = %s",element)
    if(element == null){
      //Logger.log("null !")
      return "";
    }else if(typeof element == "object"){
      //Logger.log("array = %s",element)
      st = element[0]
      for (var i = 1; i < element.length; i++){
        st = st +", " + element[i]
      }
      //Logger.log("string = %s",st)
      return st;
    }else {
      return element;
    }
  })
  //Logger.log("criteria_list = %s",criteria_list)
  //Logger.log("criteria_list.length = %s",criteria_list.length)
  if(criteria_list.length == 19 || formObject.searchtitle){//Execute if form passes search text
      result = search(formObject.searchtitle, criteria_list);
  }
  return [result[0],result[2]];
}

function search(searchtitle, criteria_list){
  //Logger.log( "function search")
  var spreadsheetId   = "1ynxX5_dkK46HuFoedqKquOMidg4yURoTxZHXYEIEvw0"
  var dataRange        = 'A2:U';                                     
  var data = Sheets.Spreadsheets.Values.get(spreadsheetId, dataRange).values; // import THE ENTIRE DATA RANGE
  //Logger.log( "data = %s",data)
  var ar = []; // ends up as an array of arrays
  var lines_array = []; //arrays of all lines to see what happens to them
  flag_flag = false 
  // filtering is done here
  data.forEach(function(f) {
    // f is an array
    lines_array.push(f)
    try {
      //if (flag_flag == false){
        //Logger.log( "Did it just work ?")
      //}
      //if (~f[0].indexOf(titre) && criteria_checker(f, criteria_list)) {
        // to be updated with full criteria list, replace tilde with https://wsvincent.com/javascript-tilde/ 
      flag_criteria = criteria_checker(f, criteria_list)
      //if (flag_flag == false){
        //Logger.log("flag!")
        //Logger.log("flag_criteria = %s",flag_criteria)
        //Logger.log("f = %s",f)
        //Logger.log("title = %s",f[0])
        //Logger.log("calling form ")
        //Logger.log("form title= %s",searchtitle)
      //}
      flag_title = f[0].includes(searchtitle)
      //if (flag_flag == false){
        //Logger.log( "flag_title = %s",flag_title)
      //}
      if (flag_title && flag_criteria) {
        if (flag_flag == false){
          //Logger.log( "It just works! I just works ! It just works !")
          flag_flag = true
        }
       ar.push(f);
      }

    }
    catch {
        if (flag_flag == false){
          Logger.log( "died horribly on if statement")
          flag_flag = true
        }
    }
  });
  //Logger.log("ar:")
  //Logger.log(ar)
  counts = dimension_counter(ar)
  //Logger.log(counts)
  return [ar,lines_array,counts];
}

function criteria_checker(f, criteria_list){
  //Logger.log( "funciton criteria_checker")
  active_criteria_list = []
  for (var i = 0; i < criteria_list.length; i++){
    if(criteria_list[i]!== undefined){
      active_criteria_list.push(i)
    }
  }
  for (var i = 0; i < active_criteria_list.length; i++){ //change here
  index = active_criteria_list[i]
    criteria = criteria_list[index]
    //Logger.log(["criteria",criteria, "index", index])
    if([4,5,6,8,9,13,15, 16, 17, 18].includes(index)){ //check for no-coma dimensions: structure, forme, type, visualisation, medias, transitions, interactions, schémas
      //Logger.log(["index", index, "f[index+2]", f[index+2]])
      sub_criteria_list = criteria.split(",");
      //Logger.log(["sub_criteria_list", sub_criteria_list])
      //Logger.log(["criteria", criteria])
      for(var j = 0; j < sub_criteria_list.length; j++){
        sub_criteria = sub_criteria_list[j]
        //Logger.log(["sub_criteria",sub_criteria])
        if (!f[index+2].includes(sub_criteria)){
          // to be improved with https://wsvincent.com/javascript-tilde/
          //Logger.log( "criteria check false !")
          //Logger.log(["missing sub_criteria",sub_criteria])
          return (false)
        }
        //Logger.log(["sub_criteria validated !",sub_criteria])
      }
    } else {
      if (!f[index+2].includes(criteria)){
        // to be improved with https://wsvincent.com/javascript-tilde/
        //Logger.log( "criteria check false !")
        return (false)
      }
    }

  } 
  //Logger.log( "criteria check true !")

  return (true)
}


function dimension_counter(ar){
  //Logger.log(ar)
  // ar = all lines out of the filter, cf function search
  // values is the list of possible values for 
  //  old : values = ["Bloomberg", "Los Angeles Times", "ProPublica", "The New York Times", "The Wall Street Journal", "WashingtonPost", "2020", "2021", "2022", "Divertir", "Expliquer", "Informer", "Persuader", "Réconforter", "Autres"]
  values = [
    ["Bloomberg", "Los Angeles Times", "ProPublica", "The New York Times", "The Wall Street Journal", "WashingtonPost"], 
    ["2020", "2021", "2022"], 
    ["Entertain","Explain","Inform","Persuade","Comfort"],
    ["Other", "Arts, culture, entertainment and media", "Conflict, war and peace", "Crime, law and justice", "Disaster, accident and emergency incident", "Economy, business and finance", "Education", "Environment", "Health", "Human interest", "Labour", "Lifestyle and leisure", "Politics", "Religion", "Science and technology", "Society", "Sport", "Weather"], 
    ["Animation","Compilation","Slideshow","Static Image","Longform Infographics","Multimedia","Storymap","Other"], 
    ["Qualitative", "Quantitative"], 
    ["Numerical","Network","Spatial","Chronological","Text","Other"], 
    ["Yes", "No"], 
    ["Heatmap","Choropleth","Navigation map","Diagramme à barres","Diagramme à bulles","Diagramme à colonnes","Diagramme circulaire","Graphique en aires","Graphique en entonnoir","Graphique Radar","Infographie","Ligne","Frise chronologique","Nuage de points","Organigramme","Pictogramme","Réseau","Table","Tableau de bord","Tracé en mosaïque","Autres","Histogramme","Modèle 3D","Diagramme a formes proportionelles","Diagramme de Sankey","Carte à Points","Graphique en gauffre","Range Chart","Spiral graphique","Carte à Symbole Proportionnel","Graphique de flux","Diagramme d'Instances","None","Cartogramme","Diagramme de Coordonées Parallèles","Treemap"], 
    ["Audio","Image","Text","Vidéo"], 
    ["None", "Explicit", "Implicit"], 
    ["Author-driven","Reader-driven","Interactive slideshow","Drill-down story","Martini glass structure"], 
    ["No sequencing","Continuous linear","Step-by-step linear","Non-linear"], 
    ["No transitions","Fading","Swiping","Tweening","Panning"], 
    ["No indicators","Progress bar","Section buttons","Timeline","Minimap","Breadcrumbs","Checklist"], 
    ["None","Abstraction/Elaboration","Comparison","Connection","Encoding","Exploration","Filter","Reconfiguration","Selection"], 
    ["None","Compare ","Concretize","Repetition"], 
    ["None","Defamiliarization","Familiarization","Physical metaphor","Convention breaking"], 
    ["None", "Speed-up/slow-down", "Breaking the 4th wall", "Make a guess", "Exploration", "Humans behind the dots", "Rethorical question", "Gradual reveal"]
  ]

  counters = [
    [0],
    [0],
    [0, 0, 0, 0, 0, 0], 
    [0, 0, 0], 
    [0,0,0,0,0], 
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], 
    [0,0,0,0,0,0,0,0], 
    [0, 0], 
    [0,0,0,0,0,0], 
    [0, 0], 
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], 
    [0,0,0,0], 
    [0, 0, 0], 
    [0,0,0,0,0], 
    [0,0,0,0], 
    [0,0,0,0,0], 
    [0,0,0,0,0,0,0], 
    [0,0,0,0,0,0,0,0,0], 
    [0,0,0,0], 
    [0,0,0,0,0], 
    [0, 0, 0, 0, 0, 0, 0, 0]
  ]
  //Logger.log(counters)
  for (var i = 0; i < ar.length; i++){
    //Logger.log(ar[i])
    //Logger.log(["values.length = jmax = ", values.length])
    for (var j = 0; j < values.length; j++){
      //Logger.log("[i,j]=")
      //Logger.log([i,j])
      dimensions_list = values[j]
      //Logger.log(["dimensions_list.length = kmax = ", dimensions_list.length, values[j]]) 
      for (var k = 0; k < dimensions_list.length; k++){
        //Logger.log("[i,j,k]=", [i,j,k])
        dim = dimensions_list[k]
        //Logger.log([dim, ar[i][j+2]])
        position = ar[i][j+2].search(dim)
        if(position != -1){
          counters[j+2][k] = counters[j+2][k] + 1
          if(j==13){
            Logger.log(["ok", ar[i][j+2]])
          }
        } else if(j==13){
            Logger.log(["faux", "position", position, "dim", dim, "ar[i][j+2]]", ar[i][j+2]])
          }
      }
    }
  }
  //Logger.log( "I'm so sorry for this abomination")
  //Logger.log(counters)
  return counters
}
