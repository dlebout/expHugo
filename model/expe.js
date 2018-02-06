/** expe.js **/

var Expe = function (array) {
    this.array_expe = array;
    console.log(array);
    this.max_id_expe = array.length;
    this.state = 0;
    this.header = null;
    this.description = null;
    this.group_count = null;
    this.dataSet = "no_dataset";
    this.main_trial = null;
    this.graph_size = null;
    this.is_new_block = false;
    this.trial = 0;
    this.block = 0;
    this.mainMotion = this.array_expe[this.state].mainMotion
    //console.log(array)
}
/****** PERMET DE PASSER AU TRIAL SUIVANT ********/
Expe.prototype.set_new_state = function (state) {
    this.state = state;
    this.set_infos();
}

Expe.prototype.set_infos = function () {
  this.is_new_block = true;
  this.block = this.array_expe[this.state].block;
  this.trial = this.array_expe[this.state].trial;
  this.practice = this.array_expe[this.state].practice;
  this.graph_size = this.array_expe[this.state].graphSize.split('-')[0];
  this.template = this.array_expe[this.state].graphSize.split('-')[1];
  //this.graph_size = this.array_expe[this.state].graphSize.split('-')[0];
  //this.template = this.array_expe[this.state].graphSize.split('-')[1];
  //this.motion_variable = this.array_expe[this.state].motionVariable;
  this.speed = this.array_expe[this.state].speed
  this.speedMapping = this.array_expe[this.state].speedMapping
  this.temporal = this.array_expe[this.state].temporal
  this.temporalMapping = this.array_expe[this.state].temporalMapping
  this.frequency = this.array_expe[this.state].frequency
  this.frequencyMapping = this.array_expe[this.state].frequencyMapping
  this.cross = this.array_expe[this.state].cross
  this.crossMapping = this.array_expe[this.state].crossMapping
  this.mainMotion = this.array_expe[this.state].mainMotion
  this.color = this.array_expe[this.state].color
  this.colorMapping = this.array_expe[this.state].colorMapping
  this.size = this.array_expe[this.state].size
  this.sizeMapping = this.array_expe[this.state].sizeMapping
  this.shape = this.array_expe[this.state].shape
  this.shapeMapping = this.array_expe[this.state].shapeMapping
  this.edgeDistance = this.array_expe[this.state].edgeDistance
  this.static_variables = []

  this.dataSet = "LayoutFinal/"
    + this.graph_size +"/"
    + "Speed/" + this.speed + "/"
    + "Temporal/" + this.temporal + "/"
    + "Frequency/" + this.frequency + "/"
    + "Cross/" + this.cross + "/"
    + "Color/" + this.color + "/"
    + "Size/" + this.size + "/"
    + "Shape/" + this.shape + "/"
    + "Template"+this.template + "/"
  //  + "MappinMotion"+this.motionMapping + "/"
    + "data_expe_temporal.json"//"data_fixed.json";//this.array_expe[this.state].dataSet;
  this.edge = "LayoutFinal/"
    + this.graph_size +"/"
    + "Speed/" + this.speed + "/"
    + "Temporal/" + this.temporal + "/"
    + "Frequency/" + this.frequency + "/"
    + "Cross/" + this.cross + "/"
    + "Color/" + this.color + "/"
    + "Size/" + this.size + "/"
    + "Shape/" + this.shape + "/"
    + "Template"+this.template + "/"
    //+ "MappinMotion"+this.motionMapping + "/"
    + "edges.json"//"data_fixed.json";//this.array_expe[this.state].dataSet;
  this.edgeOption = [this.array_expe[this.state].edgeDistance,
                    this.array_expe[this.state].speedMapping,
                    this.array_expe[this.state].temporalMapping,
                    this.array_expe[this.state].frequencyMapping,
                    this.array_expe[this.state].colorMapping,
                    this.array_expe[this.state].sizeMapping,
                    this.array_expe[this.state].shapeMapping]

  this.description = "TEXT";

  console.log(this.dataSet);
  console.log(this.edge);
  console.log(this.edgeOption);
  // if (this.visualVariable == "TemporalDistribution") { this.header = "temporal distributions";}
  // if (this.visualVariable == "PatternFrequency") { this.header = "frequencies";}
  // if (this.visualVariable == "Speed") { this.header = "speeds";}

}

Expe.prototype.show_infos = function () {

  console.log(this.header,this.is_new_block, this.block ,this.trial,this.visualVariable ,this.dataSet,this.description);
}


module.exports = Expe;
