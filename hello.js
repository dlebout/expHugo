
var http = require('http'),
    https = require('https'),
    express = require('express'),
    app = express();
	  fs = require("fs"),
    csv = require('ya-csv'),
	  bodyParser = require('body-parser'),
    formidable = require('formidable'),
    url = require('url'),
    path = require("path");

Expe = require("./model/expe.js")

var id_utilisateur = 0;
var motion_variable = "CrossingSpeedFrequency";
var expe;
var endofPractice = false


var temporary_counting_groups = {"time":null, "number_of_groups":0 };

/***** POUR LE TEMPS ******/
var start = null;
var end = null;

var db_user = null;
var db_expe = null;
var debug = true;
if (debug == false) {console.log = function(){};}


app.use(express.static(__dirname));
app.use('/application', express.static(__dirname));
app.use('/application/rest', express.static(__dirname));
app.use('/application/count_groups', express.static(__dirname));
app.use('/application/instruction', express.static(__dirname));

app.use(bodyParser.urlencoded({
  extended: true,
  parameterLimit:50000,
  limit: '500mb'
}));
//app.use(bodyParser.json());
//app.use(bodyParser.json({limit: '500mb'}))
app.use(bodyParser.json({limit: '500mb'}) );
// app.use(bodyParser.urlencoded({
//   limit: '500mb',
//    type : 'json',
//   extended: true,
//   parameterLimit:50000
// }));
 //app.register('.html', require('jade'));
app.set('view engine', 'ejs');

var server_port = process.env.PORT || 8081;
app.listen(server_port, function () {
  console.log("Particle Vis listening at http://%s:%s", server_port);
})

app.get('/login', function (req, res) {
  res.sendfile('views/login.html');
});

app.post('/send_form', function (req, res) {
  console.log("SEND")
  var form = new formidable.IncomingForm();
  var date = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');

  hand = req.body.hand;
  name = req.body.name;
  user_id = req.body.user_id;
  age = req.body.age;
  gender = req.body.gender;
  //motion_variable = req.body.motion_variable;

  speedCheck = req.body.speedCheck === undefined? false : true;
  temporalCheck = req.body.temporalCheck === undefined? false : true;
  frequencyCheck = req.body.frequencyCheck === undefined? false : true;
  crossCheck = req.body.crossCheck === undefined? false : true;

  colorCheck = req.body.colorCheck === undefined? false : true;
  sizeCheck = req.body.sizeCheck === undefined? false : true;
  shapeCheck = req.body.shapeCheck === undefined? false : true;

  console.log(user_id, name, hand, date, age, gender, colorCheck, sizeCheck, shapeCheck )
  log_users(user_id, name, hand, date, age, gender)
  res.statusCode = 302;
  res.setHeader("Location", "/read_csv");
  res.end();
});

app.get('/data/:id_data', function (req, res) {
  //var URL = req.headers.referer.split('/')[3];
  var id_data = req.params.id_data;
  fs.readFile(__dirname + "/data/"+ id_data, 'utf8', function (err, data) {

    if (err)  {  res.sendfile('views/404.html');}
    else {
        res.setHeader('Content-Type', 'application/json');
        res.end(data);
        }
    });
});

app.get('/application/instruction', function (req, res) {
  checkedVariable = []
  if (speedCheck && expe.mainMotion !== "speed") checkedVariable.push('(Speed and Frequency mix)')
  if (temporalCheck && expe.mainMotion !== "temporal") checkedVariable.push('pattern')
  if (frequencyCheck && expe.mainMotion !== "frequency") checkedVariable.push('frequency')
  if (crossCheck && expe.mainMotion !== "cross") checkedVariable.push('speed')
  if (colorCheck && expe.mainMotion !== "color") checkedVariable.push('color')
  if (sizeCheck && expe.mainMotion !== "size") checkedVariable.push('size')
  if (shapeCheck && expe.mainMotion !== "shape") checkedVariable.push('shape')
  res.render('instruction', { mainMotion: expe.mainMotion, variables: checkedVariable  });
});

/********* PERMET DE LIRE LE CSV ***********************/
app.get('/read_csv', function (req, res) {
    var reader = csv.createCsvFileReader("./followup/particles-followup.csv", { separator : ',', columnsFromHeader: true  });
    if ( !reader ) { console.log('no csv file for ' + motion_variable); return}
    var array = []

    reader.addListener('data', function(data) {
       array.push(data)
    });
    reader.on('end', function() {
      endofPractice = false
        array = return_by_id(array);
        expe = new Expe(array);
        create_db_expe();
        res.statusCode = 302;
        //res.setHeader("Location", "/application/count_groups/0");
        res.setHeader("Location", "/application/instruction")
        res.end();
    });
});

/********* PERMET DE LIRE LE CSV ***********************/
app.get('/createLayout', function (req, res) {
  res.render('generateNetwork', {});
});

/********* VISUAL CHECK OF ALL COMBINATION ***********************/
app.get('/testSpeedSize', function (req, res) {
  res.render('testSpeedSize', {});
});
app.get('/testSpeedTemporal', function (req, res) {
  res.render('testSpeedTemporal', {});
});

app.get('/testFrequencySize', function (req, res) {
  res.render('testFrequencySize', {});
});
app.get('/testFrequencyTemporal', function (req, res) {
  res.render('testFrequencyTemporal', {});
});

app.get('/testTemporalSize', function (req, res) {
  res.render('testTemporalSize', {});
});

app.get('/testCrossSize', function (req, res) {
  res.render('testCrossSize', {});
});
app.get('/testCrossShape', function (req, res) {
  res.render('testCrossShape', {});
});
app.get('/testCrossTemporal', function (req, res) {
  res.render('testCrossTemporal', {});
});
app.get('/testCrossColor', function (req, res) {
  res.render('testCrossColor', {});
});

app.get('/testD3', function (req, res) {
  res.render('testD3', {});
});

// SERT A ME CREER LE JSON POUR FIXER MES NOEUDS
app.post('/create_json_file', function (req, res) {
  //console.log(req.body)
  var path = req.body.path;
  var nodes = req.body.nodes;
  var links = req.body.links;
  var obj = {};
  //console.log(JSON.stringify(nodes))
  obj.nodes = nodes;
  obj.links = links;
  path = path.split("/");
  //var u = JSON.stringify(obj)
  var string = '{ "nodes" :'+ nodes+', "links" : '+links+'}';

  // fs.writeFile('data/'+path[0]+'/'+path[1]+ '/'+path[2]+'/data_fixed.json',string)
  fs.writeFile('data/'+ guid() +'.json',string)
  res.end(JSON.stringify({status:"OK"}));
});

/**************** STORING DATA FOR THE CLASSYFYING GROUPS ************************/
app.post('/store_data', function (req, res) {
  console.log('**********************************************************');
  console.log(req.body);
  end = Date.now();
  var temps_ecoule = (end - start) / 1000;
  temps_ecoule -= 1;
  console.log("TEMPS ECOULE", end - start);
  var task_number = req.headers.referer.split('/')[4];
  console.log(task_number);
  //add_to_table(req.body, temporary_counting_groups.time, temps_ecoule)

  //-1 CAR C'EST MON DERNIER TRUC QUE JE FAIS
  if (task_number  >= expe.max_id_expe - 1){
    res.end(JSON.stringify({status:"OK", redirection:"../../../application/finish"}));
  }
  else{
    res.end(JSON.stringify({status:"OK", redirection:"../../../application/rest/"+task_number}));
  }
});
/**************** STORING DATA FOR THE COUNTING GROUPS ************************/
app.post('/store_data_counting_group', function (req, res) {
  end = Date.now();
  console.log(end);
  var temps_ecoule = (end - start) / 1000;
  temps_ecoule -= 1;
  var task_number = req.body.redirection;
  console.log("task", task_number);
  add_to_table(req.body, temps_ecoule)

  if (task_number  >= expe.max_id_expe - 1){
    res.end(JSON.stringify({status:"OK", redirection:"../../../application/finish"}));
  }
  else if (task_number  == 4 && endofPractice === false){
    endofPractice = true
    res.end(JSON.stringify({status:"OK", redirection:"../../../application/practice"}));
  }else{
    res.end(JSON.stringify({status:"OK", redirection:"../../../application/rest/"+task_number}));
  }

});

app.get('/application/rest/:new_task', function (req, res) {
  res.render('rest');
});
app.get('/application/finish', function (req, res) {
  res.render('finish');
});
app.get('/application/practice', function (req, res) {
  res.render('practice');
});

/************** APPLICATION COUNTING GROUPS *****************/
app.get('/application/count_groups/:id_map', function (req, res) {
  start = Date.now();
  var id = parseInt(req.params.id_map);
  expe.set_new_state(id);
  res.render('count_groups', { id_user :id_utilisateur, header: expe.header, description: expe.description , data : expe.dataSet, edge: expe.edge, edgeOption: expe.edgeOption, trial: id+1, max_trial:expe.max_id_expe, mainMotion:expe.mainMotion });
});
/************** APPLICATION CLASYFYING GROUPS *****************/
app.get('/application/:id_map', function (req, res) {
  start = Date.now();
  var id = parseInt(req.params.id_map);
  console.log(expe.max_id_expe, "TASK NUMBER", id);

  if (id >= expe.max_id_expe){
    res.statusCode = 302;
    res.setHeader("Location", "/application/finish");
    res.end();
  }
  else{
    res.statusCode = 302;
    res.render('index', { id_user :id_utilisateur, header: expe.header, description: expe.description , data : expe.dataSet, edge: expe.edge, trial: id+1, max_trial:expe.max_id_expe, visualVariable:expe.motion_variable });
    res.end();
  }
});

app.get('/*', function (req, res) {
  var map_id = req.url.split('/')[1];
  res.sendfile('views/404.html');
});

















/******************* FONCTION UTILES *****************/

function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +s4() + '-' + s4() + s4() + s4();
}
function log_users(id, name, hand, date, age, gender){
  id_utilisateur = id;
  create_db_user(id);
  add_user_to_infos(id, name, hand, date, age, gender);

  //db_expe = csv.createCsvStreamWriter(fs.createWriteStream('db/database_user'+id_utilisateur+'_expe_'+expe.block_name+'.csv'));
  //db_expe.writeRecord(['user_id', 'task_name' , 'trial', 'id_link', 'value', 'temporal_distribution', 'speed', 'frequency_pattern']);
}


function create_db_expe(staticVariables){
  var dt = new Date();
  var date = dt.getFullYear() + "_" + (dt.getMonth() + 1) + "_" + dt.getDate() + "_" + dt.getHours() + "h_" + dt.getMinutes()+ "mn_" + dt.getSeconds();
  //SI LE FICHIER N"EXISTE PAS JE LE CREE
  // if (!fs.existsSync('db/database_user_'+id_utilisateur+'.csv')) {
  //   console.log("CREATE FILE");
  var fileNameOption = ""
  if ( speedCheck ) fileNameOption += "_speed"
  if ( temporalCheck ) fileNameOption += "_temporal"
  if ( frequencyCheck ) fileNameOption += "_frequency"
  if ( crossCheck ) fileNameOption += "_cross"
  if ( colorCheck ) fileNameOption += "_color"
  if ( sizeCheck ) fileNameOption += "_size"
  if ( shapeCheck ) fileNameOption += "_shape"

  db_expe = csv.createCsvStreamWriter(fs.createWriteStream('db/database_user_'+id_utilisateur+'_'+date+fileNameOption+'.csv'), { separator : ';' });
    //db_expe.writeRecord(['user_id', 'task_name' , 'trial', 'id_link', 'value', 'temporal_distribution', 'speed', 'frequency_pattern']);
    //, { separator : ';' }
    // 1 - id de l'utilisateur
    // 2 - nombre de groupe total (GroupCount)
    // 3 - Nombre d'edges mal placees
    // 4 -
    // 5 -
    // 6 - A reussi ou pas
    // 7 - Nombre d'edges mal placees / nombre total d'edges
    // 8 - Temps 1 ere expe
    // 9 - Temps 2 eme expe

  header = ['USER_ID',"practice","BLOCK", "TRIAL","GRAPH_SIZE","mainMotion","speed",	"frequency",	"temporal",
  	"cross",	"speedMapping",	"frequencyMapping",	"temporalMapping"	,"crossMapping"	,"color"
    ,"colorMapping",	"size"	,"sizeMapping",	"shape",	"shapeMapping"	,"edgeDistance"
    ,"NUMBER_OF_NODES","NUMBER_OF_EDGES", "completion_time",	"edgeA_speed",	"edgeA_frequency",	"edgeA_temporal",
    "edgeA_color",	"edgeA_size",	"edgeA_shape",	"edgeB_speed",	"edgeB_frequency",	"edgeB_temporal",
    "edgeB_color",	"edgeB_size",	"edgeB_shape",	"edgeB_original_speed",	"edgeB_original_frequency",	"edgeB_original_temporal",
    "difference_speed", "difference_frequency", "keyPressedList"]

  console.log('Found file');
  db_expe.writeRecord(header);
  // }
  //SI IL EXISTE J'APPEND MES DONNEES A LA SUITE
  // else{
  //   db_expe = csv.createCsvFileWriter('db/database_user_'+id_utilisateur+'.csv', { separator : ';' , 'flags': 'a'});
  // }
}

function add_to_table(value,  time){
  if (id_utilisateur == null){console.log("id_utilisateur est null ...."); }

  //Transform to array
  //var array = JSON.stringify(value);
  //console.log(array);


  //var model = get_number_groups(value.links);
  //console.log("DATABASE_GROUP", model);

  //var user_groups = get_users_group(value.links);
  //console.log("USER", user_groups);


  // model = [ { edges: [ 6, 7 ], pattern: '0' },
  // { edges: [ 0, 2, 4 ], pattern: '0.4,0.6,0.8' },
  // { edges: [ 1, 3, 5 ], pattern: '0,0.2' } ];
  //
  // user_groups = [ { edges: [ 0, 6 ] },
  // { edges: [ 1,4,7 ] }];

  // REORDER THE ARRAY TO HAVE ALWAYS THE SAME ORDER
  // FOR EVERY visualVariable
  /*model = model.sort(function(a, b) {
    return parseFloat(a.pattern) - parseFloat(b.pattern);
  });
*/

/*
  console.log("DATABASE_GROUP\n", model);
  console.log("USER\n", user_groups);
  // console.log(value)

  // PERMET DE MESURER L'ERREUR
  var rate = rate_error(model, user_groups);
  console.log("SIMILARITY ARRAY\n", rate.array_of_symilarity)
  //console.log(  expe.block,expe.trial,expe.group_count,expe.graph_size,expe.motion_variable)
  //{"edge_wrong_placement":data, "number_groups_found": user_groups.length, "total_group": models.length, "isWinning":iswinning }

  //CALCUL LE MAX DE CHAQUE LIGNE DE LA MATRICE DE SIMILARITE
  //Special pour Temporal car la distribution change
  if (expe.motion_variable == "TemporalDistribution"){
    if (expe.group_count == "Small"){
      var G2 = Math.max.apply(Math, rate.array_of_symilarity[0]);
      var G6 = Math.max.apply(Math, rate.array_of_symilarity[1]);
    }
    if (expe.group_count == "Medium"){
      var G1 = Math.max.apply(Math, rate.array_of_symilarity[0]);
      var G2 = Math.max.apply(Math, rate.array_of_symilarity[1]);
      var G3 = Math.max.apply(Math, rate.array_of_symilarity[2]);
      var G6 = Math.max.apply(Math, rate.array_of_symilarity[3]);
    }
    if (expe.group_count == "Large"){
      var G1 = Math.max.apply(Math, rate.array_of_symilarity[0]);
      var G2 = Math.max.apply(Math, rate.array_of_symilarity[1]);
      var G3 = Math.max.apply(Math, rate.array_of_symilarity[2]);
      var G4 = Math.max.apply(Math, rate.array_of_symilarity[3]);
      var G5 = Math.max.apply(Math, rate.array_of_symilarity[4]);
      var G6 = Math.max.apply(Math, rate.array_of_symilarity[5]);
    }
  }
  else{
    var G1 = Math.max.apply(Math, rate.array_of_symilarity[0]);
    var G2 = Math.max.apply(Math, rate.array_of_symilarity[1]);
    var G3 = Math.max.apply(Math, rate.array_of_symilarity[2]);
    var G4 = Math.max.apply(Math, rate.array_of_symilarity[3]);
    var G5 = Math.max.apply(Math, rate.array_of_symilarity[4]);
    var G6 = Math.max.apply(Math, rate.array_of_symilarity[5]);
  }

  var isWinning_FIRST_STEP = false;

  // SI LE NOMBRE DE GROUPE EQUIVAUT AU NOMBRE DE GROUPE TROUVE PAR L'UTILISATEUR
  if (parseInt(temporary_counting_groups.number_of_groups) == parseInt(model.length)){ isWinning_FIRST_STEP = true; }

  //Calcul le pourcentage pour que ca marche
  var percent_wrong_edges = rate.edge_wrong_placement.length / value.links.length;
*/

  graphA = JSON.parse(value.graphA);
  graphB = JSON.parse(value.graphB);
  graphBClean = JSON.parse(value.graphBClean);
  keyList = JSON.parse(value.keyPressedList);
  console.log(keyList);
  res= [id_utilisateur,expe.practice,expe.block,expe.trial, expe.graph_size+"_"+expe.template,expe.mainMotion, expe.speed, expe.frequency, expe.temporal, expe.cross,
        expe.speedMapping, expe.frequencyMapping, expe.temporalMapping, expe.crossMapping, expe.color, expe.colorMapping, expe.size, expe.sizeMapping,
        expe.shape, expe.shapeMapping, expe.edgeDistance, value.nb_nodes, value.nb_links, time,
        graphA.speed, graphA.frequency, graphA.temporal, graphA.color, graphA.size, graphA.shape,
        graphB.speed, graphB.frequency, graphB.temporal, graphB.color, graphB.size, graphB.shape,
        graphBClean.speed, graphBClean.frequency, graphBClean.temporal,
        graphB.speed-graphA.speed, graphB.frequency-graphA.frequency,
        keyList
      ]

  db_expe.writeRecord(res);

  console.log("TEMPORARY", temporary_counting_groups)
}

function getSortedKeys(obj) {
    var keys = []; for(var key in obj) keys.push(key);
    return keys.sort(function(a,b){return obj[a]-obj[b]});
}


/******* PREND MON USER EDGES ET MON MODEL EDGES ET LES COMPARE POUR SAVOIR QUI EST MAL PLACE ************/
function rate_error(models, user_groups){
  // RECUPERE LES BEST MATCHES DES GROUPES
  var array_of_symilarity = [];

  //CREATE AND NORMALIZE MY VALUES
  for (var i=0; i < models.length; i++){
    var tab = new Array();
      for (var j=0; j<user_groups.length; j++){
        var same_values = intersect_array(models[i].edges, user_groups[j].edges);
        var total = delete_doublons(models[i].edges.concat(user_groups[j].edges));
        //console.log("TOTAL", total)
        tab.push(same_values.length/total.length);
        //console.log(same_values, total_length);
      }
      array_of_symilarity.push(tab);
  }

  // RECUPERE LA VALEUR MXIMUM L'ASSOCIE AU GROUPE ET EXCLU LE GROUP ET L'USER POUR LES PROCHAINE ITERATION
  // PUIS
  var tableau_matching = [];
  var user = null;
  var group = null;
  var model_used = [];
  var user_group_used = [];

  // SI J'AI MOINS DE GROUPES QUE LE MODELE UTILISE
  var length_iteration = models.length;
  if (user_groups.length < length_iteration) length_iteration = user_groups.length;

  // D'abord je prend les MAX puis je descend dans le tableau
  for (var k=0; k<length_iteration; k++){
    var max = 0;
    for (var i=0; i<array_of_symilarity.length; i++){
      if(model_used.indexOf(i) == -1){
        var object = array_of_symilarity[i];
        for (var j=0; j<object.length; j++){
          if(user_group_used.indexOf(j) == -1){
            if(object[j] > max) {
              max = object[j];
              group = i;
              user = j;
            }
            //console.log(j, object[j], max);
          }
        }
      }

    }
    tableau_matching.push({value:max, group_model:group, group_user:user})
    model_used.push(group)
    user_group_used.push(user)

  }
  /************* CONTIENT LE TABLEAU RECAPITULATIF DES CHOIX EFFECTUE *******/
  console.log("TABLEAU MATCHING\n", tableau_matching)
  // RECUPERE TOUT LE TABLEAU DES EGES
  var array_edges = [];
  for (var i=0; i<models.length; i++){
     array_edges = array_edges.concat(models[i].edges)
  }

  console.log("EDGES ARRAY \n", array_edges);
  // RECUPERE LES DIFFERENCES ENTRE LES DEUX GROUPES
  var edge_wrong_placement = [];
  for (var i=0; i<tableau_matching.length; i++){
    var object = tableau_matching[i];
    var model_edges = models[object.group_model].edges;
    var user_edges = user_groups[object.group_user].edges;
    var difference = model_edges.filter(x => user_edges.indexOf(x) == -1).concat(user_edges.filter(x => model_edges.indexOf(x) == -1));
    edge_wrong_placement = edge_wrong_placement.concat(difference)
    //console.log(difference)
  }
  //console.log(edge_wrong_placement)
  //DELETE TUPLES
  edge_wrong_placement = delete_doublons(edge_wrong_placement);

  var iswinning = false;
  //if (tableau_matching.length == user_groups.length && edge_wrong_placement.length == 0){iswinning = true;}
  if (user_groups.length != 0 && edge_wrong_placement.length == 0){iswinning = true;}
  console.log("EDGES WRONG PLACEMENT\n", edge_wrong_placement)
  return {"edge_wrong_placement":edge_wrong_placement, "number_groups_found": user_groups.length, "isWinning": iswinning, 'array_of_symilarity':array_of_symilarity }

}

function delete_doublons(array){

  array = array.filter(function(elem, index, self) {
    return index == self.indexOf(elem);
  })
  //console.log("ARRAY", array)
  return array;

}
function get_number_groups(array){
  //Transform array in string
  var tab = [];
  for (var i=0; i<array.length; i++){
    if (expe.motion_variable == "TemporalDistribution") tab.push(array[i].temporal.toString())
    if (expe.motion_variable == "Speed") tab.push(array[i].speedParticule.toString())
    if (expe.motion_variable == "PatternFrequency") tab.push(array[i].frequencyParticule.toString())
    if (expe.motion_variable == "CrossingSpeedFrequency") tab.push(array[i].speedParticule.toString())
  }
  //console.log(tab)

  //count values
  var counts = {};
  tab.forEach(function(x) { counts[x] = (counts[x] || 0) +1; });

  //get index of values
  var obj = [];
  for(var i in counts){
    var edges = [];
    for(var j=0; j<tab.length;j++) {
        if (tab[j] === i) edges.push(j);
    }
    //alert(foo[i]); //alerts key's value
    obj.push({"edges" : edges, "pattern" : i})
  }
  //console.log(obj)
  return obj;
}

function get_users_group(array){
  // RETOURNE LE NOMBRE DE GROUPES
  //TRANSFORME LE TABLEAU EN STRING
  var tab = [];
  for (var i=0; i<array.length; i++){
    if (array[i].rank == undefined){tab.push('-1')}
    else{tab.push(array[i].rank[0])}
  }
  //console.log(tab)

  //COMPTE COMBIEN DENTITE J'AI
  var counts = {};
  tab.forEach(function(x) { counts[x] = (counts[x] || 0) +1; });

  //REGARDE LES ID DES CHOSES RECUPERES
  //console.log(counts)
  var obj = [];
  for(var i in counts){
    if (i != -1){
      var edges = [];
      for(var j=0; j<tab.length;j++) {
          if (tab[j] === i ) edges.push(j);
      }
      //alert(foo[i]); //alerts key's value
      obj.push({"edges" : edges})
    }

  }
  return obj;


}

function create_db_user(id_expe){
  var dt = new Date();
  var date = dt.getFullYear() + "_" + (dt.getMonth() + 1) + "_" + dt.getDate() + "_" + dt.getHours() + "h_" + dt.getMinutes()+ "mn_" + dt.getSeconds();
  //Si le fichier n'existe pas
  //if (!fs.existsSync('db/user'+id_utilisateur+'.csv')) {
    db_user = csv.createCsvStreamWriter(fs.createWriteStream('db/user'+id_utilisateur+'_'+date+'.csv'));
    db_user.writeRecord(['user_id ', 'name', 'common_hand', 'date', 'age', 'gender']);
  //}
}
function add_user_to_infos(id, name, hand, date, age, gender){
  //Si le fichier n'existe pas
  //if (!fs.existsSync('db/user'+id_utilisateur+'.csv')) {
    db_user.writeRecord([id, name, hand, date, age, gender]);
  //}
}

function return_by_id(array){
  var tab = [];
    for (var i=0; i<array.length; i++){
      console.log(parseInt(array[i].participant_id) , id_utilisateur)
      if (parseInt(array[i].participant_id) == id_utilisateur && id_utilisateur < 0){
        tab.push(array[i])
      }else{
          if (parseInt(array[i].participant_id) == id_utilisateur
          && ( (speedCheck && array[i].speed !== 'Null') || (!speedCheck && array[i].speed === 'Null') )
          && ( (temporalCheck && array[i].temporal !== 'Null') || (!temporalCheck && array[i].temporal === 'Null') )
          && ( (crossCheck && array[i].cross !== 'Null') || (!crossCheck && array[i].cross === 'Null') )
          && ( (frequencyCheck && array[i].frequency !== 'Null') || (!frequencyCheck && array[i].frequency === 'Null') ) ){
          line = Object.keys(array[i]).map(key => array[i][key])
          insert = true
          if ( ((colorCheck && array[i].color === '1') || (!colorCheck && array[i].color !== '1'))
            ||  ((sizeCheck && array[i].size === '1') || (!sizeCheck && array[i].size !== '1'))
            ||  ((shapeCheck && array[i].shape === '1') || (!shapeCheck && array[i].shape !== '1')) ) insert = false
          if ( insert  ){
            tab.push(array[i])
          }
        }
      }
    }
    console.log(tab);
    return tab;
}

function intersect_array(a, b){
  var ai=0, bi=0;
  var result = [];

  while( ai < a.length && bi < b.length )
  {
     if      (a[ai] < b[bi] ){ ai++; }
     else if (a[ai] > b[bi] ){ bi++; }
     else /* they're equal */
     {
       result.push(a[ai]);
       ai++;
       bi++;
     }
  }

  return result;
}
