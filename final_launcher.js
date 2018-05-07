
var http = require('http'),
    https = require('https'),
    express = require('express'),
    app = express();
	  fs = require("fs"),
    csv = require('ya-csv'),
	  bodyParser = require('body-parser'),
    formidable = require('formidable'),
    url = require('url'),
    d3 = require('d3'),
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
app.use('/application/luminanceSizeTest', express.static(__dirname));

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
  res.render('instruction', { mainMotion: expe.mainMotion });
});

app.get('/application/luminanceSizeTest', function (req, res) {
  res.render('luminanceSizeTest', { mainMotion: expe.mainMotion });
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
  var task_number = req.body.redirection;
  console.log("task", task_number);
  add_to_table(req.body)

  if (task_number  > expe.max_trial - 2){
    res.end(JSON.stringify({status:"OK", redirection:"../../../application/finish"}));
  }
  else if (task_number  == 3 && endofPractice === false){
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
  res.render('count_groups', { id_user :id_utilisateur, data : expe.dataSet, edge: expe.edge, edgeOption: expe.edgeOption, trial: id+1, max_trial:expe.max_id_expe });
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

  db_expe = csv.createCsvStreamWriter(fs.createWriteStream('db/logs/log_user_'+id_utilisateur+'_'+date+'.csv'), { separator : ';' });


  header = ["participant",
  	"trial",
    "practice",
    "speed",
    "delta_luminance",
    "action",
    "completion_time",
    "edgeA_speed", "edgeA_color",
    "edgeB_speed", "edgeB_color",
    "delta_speed",
    "observation"
  ]

  console.log('Found file');
  db_expe.writeRecord(header);
  // }
  //SI IL EXISTE J'APPEND MES DONNEES A LA SUITE
  // else{
  //   db_expe = csv.createCsvFileWriter('db/database_user_'+id_utilisateur+'.csv', { separator : ';' , 'flags': 'a'});
  // }
}

function add_to_table(value){
  if (id_utilisateur == null){console.log("id_utilisateur est null ...."); }

  graphA = JSON.parse(value.graphA);
  graphB = JSON.parse(value.graphB);
  graphBClean = JSON.parse(value.graphBClean);
  keyList = JSON.parse(value.keyPressedList);
  completionTime = JSON.parse(value.completion_time);
  res = [id_utilisateur,
        expe.trial,
        expe.practice,
        (Number(expe.speed_reference)*12*23.5)/100,
        expe.luminance_pair,
        expe.speed_target,
        completionTime,
        (Number(graphA.speed)*12*23.5)/100, graphA.color,
        (Number(graphB.speed)*12*23.5)/100, graphB.color,
        (Number(graphB.speed-graphA.speed)*12*23.5)/100, //d3.hsl(graphA.color).l-d3.hsl(graphB.color).l ,
        keyList
      ]

  db_expe.writeRecord(res);

}

function getSortedKeys(obj) {
    var keys = []; for(var key in obj) keys.push(key);
    return keys.sort(function(a,b){return obj[a]-obj[b]});
}

function create_db_user(id_expe){
  var dt = new Date();
  var date = dt.getFullYear() + "_" + (dt.getMonth() + 1) + "_" + dt.getDate() + "_" + dt.getHours() + "h_" + dt.getMinutes()+ "mn_" + dt.getSeconds();

    db_user = csv.createCsvStreamWriter(fs.createWriteStream('db/users/user'+id_utilisateur+'_'+date+'.csv'));
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
      if (parseInt(array[i].Participant) == id_utilisateur){
        tab.push(array[i])
      }
    }
    console.log(tab);
    return tab;

}
