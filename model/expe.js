/** expe.js **/

var Expe = function (array) {
    this.array_expe = array;
    this.max_trial = array.length;
    this.index_reader = 0;

    this.graph = "";
    this.edges = "";
}
/****** PERMET DE PASSER AU TRIAL SUIVANT ********/
Expe.prototype.set_new_state = function (state) {
    this.index_reader = state;
    this.set_infos();
}

Expe.prototype.set_infos = function () {
  this.trial = this.array_expe[this.index_reader].trial;
  this.practice = this.array_expe[this.index_reader].practice;

  this.graph = this.array_expe[this.index_reader].graph;
  this.replication = this.array_expe[this.index_reader].replication;
  this.speed_reference = this.array_expe[this.index_reader].speed_reference;
  this.speed_target = this.array_expe[this.index_reader].speed_target;
  this.luminance_pair = this.array_expe[this.index_reader].luminance_pair;
  this.assign_to = this.array_expe[this.index_reader].assign_to;

  this.dataSet = "data/speed_luminance_achromatic/graph.json"
  this.edge = "data/speed_luminance_achromatic/edgesJND.json"

  this.edgeOption = [
    this.replication,
    this.speed_reference,
    this.speed_target,
    this.luminance_pair,
    this.assign_to
  ]

  console.log(this.dataSet);
  console.log(this.edge);
  console.log(this.edgeOption);

}

Expe.prototype.show_infos = function () {
  console.log(this.header,this.is_new_block, this.block ,this.trial,this.visualVariable ,this.dataSet,this.description);
}

module.exports = Expe;
