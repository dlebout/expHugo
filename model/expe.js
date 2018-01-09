/** expe.js **/

var Expe = function (array) {
    this.array_expe = array;


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
    //console.log(array)
}
/****** PERMET DE PASSER AU TRIAL SUIVANT ********/
Expe.prototype.set_new_state = function (state) {
    this.state = state;
    this.set_infos();
}

Expe.prototype.set_infos = function () {

  // console.log(this.array_expe)
  this.is_new_block = true;
  this.block = this.array_expe[this.state].block;
  this.trial = this.array_expe[this.state].trial;
  this.group_count = this.array_expe[this.state].groupCount;
  this.graph_size = this.array_expe[this.state].graphSize;
  this.visualVariable = "CrossingSpeedFrequency";//this.array_expe[this.state].visualVariable;

  //console.log(this.array_expe)
  this.dataSet = this.visualVariable + "/" + this.group_count +"/" + this.graph_size +"/" + "data_expe_temporal.json"//"data_fixed.json";//this.array_expe[this.state].dataSet;

  this.description = "TEXT";
  // if (this.visualVariable == "TemporalDistribution") { this.header = "temporal distributions";}
  // if (this.visualVariable == "PatternFrequency") { this.header = "frequencies";}
  // if (this.visualVariable == "Speed") { this.header = "speeds";}

}

Expe.prototype.show_infos = function () {

  console.log(this.header,this.is_new_block, this.block ,this.trial,this.visualVariable ,this.dataSet,this.description);
}


module.exports = Expe;
