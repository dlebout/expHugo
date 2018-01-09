
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
var visual_variable = "CrossingSpeedFrequency";
var expe;



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


app.post('/send_form', function (req, res) {
  console.log("SEND")
  var form = new formidable.IncomingForm();
  var date = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');

  hand = req.body.hand;
  name = req.body.name;
  user_id = req.body.user_id;
  age = req.body.age;
  gender = req.body.gender;
  visual_variable = req.body.visual_variable;

  console.log(user_id, name, hand, date, age, gender, visual_variable)
  log_users(user_id, name, hand, date, age, gender)
  res.statusCode = 302;
  res.setHeader("Location", "/read_csv");
  res.end();
});

app.get('/login', function (req, res) {
  res.sendfile('views/login.html');
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
/********* PERMET DE LIRE LE CSV ***********************/
app.get('/read_csv', function (req, res) {
    var array = [];
    var reader = csv.createCsvFileReader("particles-followup-15.csv", { separator : ',' }); // quotes around property name are optional});
    reader.setColumnNames([ "Participant","Practice","Block","Trial","GroupCount","GraphSize"]);
    reader.addListener('data', function(data) {
    	// console.log(data)
       array.push({ "participant_id" : data.Participant, "practice" : data.Practice, "block" : data.Block, "trial" : data.Trial, "visualVariable" : "CrossingSpeedFrequency" , "groupCount" : data.GroupCount , "graphSize" : data.GraphSize})
    });
    reader.on('end', function() {
        array = return_by_id(array);
        //console.log(array);
        expe = new Expe(array);
        create_db_expe();
        res.statusCode = 302;
        res.setHeader("Location", "/application/count_groups/0");
        res.end();
    });
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

  fs.writeFile('data/'+path[0]+'/'+path[1]+ '/'+path[2]+'/data_fixed.json',string)
  res.end(JSON.stringify({status:"OK"}));
});

/**************** STORING DATA FOR THE CLASSYFYING GROUPS ************************/
app.post('/store_data', function (req, res) {
  end = Date.now();
  var temps_ecoule = (end - start) / 1000;
  temps_ecoule -= 1;
  console.log("TEMPS ECOULE", end - start);
  console.log("Visual Variable", expe.visualVariable)
  var task_number = req.headers.referer.split('/')[4];
  add_to_table(req.body, temporary_counting_groups.time, temps_ecoule)

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
  var temps_ecoule = (end - start) / 1000;
  temps_ecoule -= 1;
  var task_number = req.body.redirection;
  temporary_counting_groups.time = temps_ecoule;
  temporary_counting_groups.number_of_groups = req.body.number_of_groups;

  if (task_number  >=expe.max_id_expe ){
    res.end(JSON.stringify({status:"OK", redirection:"../../../application/finish"}));
  }
  else{
    res.end(JSON.stringify({status:"OK", redirection:"../../../application/"+task_number}));
  }
});

app.get('/application/rest/:new_task', function (req, res) {
  res.render('rest');
});
app.get('/application/finish', function (req, res) {
  res.render('finish');
});

/************** APPLICATION COUNTING GROUPS *****************/
app.get('/application/count_groups/:id_map', function (req, res) {
  start = Date.now();
  var id = parseInt(req.params.id_map);
  //console.log(expe)
  expe.set_new_state(id);
  console.log(expe.dataSet)
  res.render('count_groups', { id_user :id_utilisateur, header: expe.header, description: expe.description , data : expe.dataSet, trial: id+1, max_trial:expe.max_id_expe, visualVariable:expe.visualVariable });
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
    res.render('index', { id_user :id_utilisateur, header: expe.header, description: expe.description , data : expe.dataSet, trial: id+1, max_trial:expe.max_id_expe, visualVariable:expe.visualVariable });
    res.end();
  }
});

app.get('/*', function (req, res) {
  var map_id = req.url.split('/')[1];
  res.sendfile('views/404.html');
});

















/******************* FONCTION UTILES *****************/

function log_users(id, name, hand, date, age, gender){
  id_utilisateur = id;
  create_db_user(id);
  add_user_to_infos(id, name, hand, date, age, gender);

  //db_expe = csv.createCsvStreamWriter(fs.createWriteStream('db/database_user'+id_utilisateur+'_expe_'+expe.block_name+'.csv'));
  //db_expe.writeRecord(['user_id', 'task_name' , 'trial', 'id_link', 'value', 'temporal_distribution', 'speed', 'frequency_pattern']);
}


function create_db_expe(){
  var dt = new Date();
  var date = dt.getFullYear() + "_" + (dt.getMonth() + 1) + "_" + dt.getDate() + "_" + dt.getHours() + "h_" + dt.getMinutes()+ "mn_" + dt.getSeconds();
  //SI LE FICHIER N"EXISTE PAS JE LE CREE
  // if (!fs.existsSync('db/database_user_'+id_utilisateur+'.csv')) {
  //   console.log("CREATE FILE");
  db_expe = csv.createCsvStreamWriter(fs.createWriteStream('db/database_user_'+id_utilisateur+'_'+date+'.csv'), { separator : ';' });
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

  db_expe.writeRecord(['USER_ID',"BLOCK", "TRIAL", "GROUP_COUNT","GRAPH_SIZE", "VISUAL_VARIABLE","NUMBER_OF_GROUPS","NUMBER_OF_NODES","NUMBER_OF_EDGES",'MISLABELED_EDGES','NUMBER_MISLABELED_EDGES','NUMBER_GROUPS_FOUND_FIRST_STEP','NUMBER_GROUPS_FOUND_SECOND_STEP',"HIT_FIRST_STEP","HIT_SECOND_STEP", "PERCENT_EDGES_WRONG_PLACEMENT","TIME_COUNTING_GROUPS","TIME_CLASSIFYING_GROUPS","DATABASE_GROUP","USER_GROUP","SIMILARITY_ARRAY","G1","G2","G3","G4","G5","G6","BRUT_DATA"]);
  console.log('Found file');
  // }
  //SI IL EXISTE J'APPEND MES DONNEES A LA SUITE
  // else{
  //   db_expe = csv.createCsvFileWriter('db/database_user_'+id_utilisateur+'.csv', { separator : ';' , 'flags': 'a'});
  // }
}

function add_to_table(value,  time_counting_groups, time_classifying_groups){
  //console.log(value)
  if (id_utilisateur == null){console.log("id_utilisateur est null ...."); }

  //Transform to array
  var array = JSON.stringify(value);



  var model = get_number_groups(value.links);
  //console.log("DATABASE_GROUP", model);

  var user_groups = get_users_group(value.links);
  //console.log("USER", user_groups);


  // model = [ { edges: [ 6, 7 ], pattern: '0' },
  // { edges: [ 0, 2, 4 ], pattern: '0.4,0.6,0.8' },
  // { edges: [ 1, 3, 5 ], pattern: '0,0.2' } ];
  //
  // user_groups = [ { edges: [ 0, 6 ] },
  // { edges: [ 1,4,7 ] }];

  // REORDER THE ARRAY TO HAVE ALWAYS THE SAME ORDER
  // FOR EVERY visualVariable
  model = model.sort(function(a, b) {
    return parseFloat(a.pattern) - parseFloat(b.pattern);
  });



  console.log("DATABASE_GROUP\n", model);
  console.log("USER\n", user_groups);
  // console.log(value)


  // PERMET DE MESURER L'ERREUR
  var rate = rate_error(model, user_groups);
  console.log("SIMILARITY ARRAY\n", rate.array_of_symilarity)
  //console.log(  expe.block,expe.trial,expe.group_count,expe.graph_size,expe.visualVariable)
  //{"edge_wrong_placement":data, "number_groups_found": user_groups.length, "total_group": models.length, "isWinning":iswinning }

  //CALCUL LE MAX DE CHAQUE LIGNE DE LA MATRICE DE SIMILARITE
  //Special pour Temporal car la distribution change
  if (expe.visualVariable == "TemporalDistribution"){
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
  db_expe.writeRecord([id_utilisateur,expe.block,expe.trial,expe.group_count,expe.graph_size,expe.visualVariable, model.length, value.nodes.length, value.links.length, rate.edge_wrong_placement, rate.edge_wrong_placement.length, temporary_counting_groups.number_of_groups, rate.number_groups_found, isWinning_FIRST_STEP ,rate.isWinning , percent_wrong_edges, time_counting_groups, time_classifying_groups, JSON.stringify(model), JSON.stringify(user_groups), JSON.stringify(rate.array_of_symilarity), G1,G2,G3,G4,G5,G6, array ]);

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
  //console.log("SIMILARITY ARRAY\n", array_of_symilarity)

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
  //console.log(array)
  for (var i=0; i<array.length; i++){
    if (expe.visualVariable == "TemporalDistribution") tab.push(array[i].temporal.toString())
    if (expe.visualVariable == "Speed") tab.push(array[i].speed.toString())
    if (expe.visualVariable == "PatternFrequency") tab.push(array[i].frequency.toString())
    if (expe.visualVariable == "CrossingSpeedFrequency") tab.push(array[i].speed.toString())
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
      //A CHANGER POUR AVOIR LE BON UTILISATEUR
      //if (parseInt(array[i].participant_id) == 0){
      if (parseInt(array[i].participant_id) == id_utilisateur && array[i].visualVariable == visual_variable){
        tab.push(array[i])
      }
    }
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
