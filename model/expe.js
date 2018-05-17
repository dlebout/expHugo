/** expe.js **/

var Expe = function (array) {
    this.array_expe = array;
    this.max_trial = array.length;
    this.index_reader = 0;

    this.graph = "";
    this.edges = "";
    this.trial = 0;
}
/****** PERMET DE PASSER AU TRIAL SUIVANT ********/
Expe.prototype.set_new_state = function (state) {
    this.index_reader = state;
    this.set_infos();
}

Expe.prototype.set_infos = function () {
  this.trial = this.array_expe[this.index_reader].Trial;
  this.practice = this.array_expe[this.index_reader].Practice;
  this.block = this.array_expe[this.index_reader].Block;

  this.speed_reference = this.array_expe[this.index_reader].Speed;
  this.speed_target = this.array_expe[this.index_reader].Action;
  this.luminance_pair = this.array_expe[this.index_reader].Luminance;

  this.dataSet = "data/edges_layout"
  this.edge = "./data/edges_layout/edgesJND-"+ "luminant" +".json"

  this.edgeOption = [
    this.speed_reference,
    this.speed_target,
    this.luminance_pair
  ]

  console.log(this.dataSet);
  console.log(this.edge);
  console.log(this.edgeOption);

}

Expe.prototype.show_infos = function () {
  console.log(this.header,this.is_new_block, this.block ,this.trial,this.visualVariable ,this.dataSet,this.description);
}

module.exports = Expe;
