
function d3_graph(nodes_tab, links_tab, offset_x){
    //console.log("HEEEEEEEYYYY JE SUIS LA ")
    var self = this;
    this.color = d3.scale.category10();
    this.scale = d3.scale.linear()
                    .domain([0, 5])
                    .range([60, 200]);

    this.alphabet = 'abcdefghijklmnopqrstuvwxyz';

    //Tableau contenant seulement les id des tooltip
    this.edge_id_group = [];
    //populate the edge_id_group tableau du nombre de liens
    for (var j=0; j< links_tab.length; j++){this.edge_id_group.push([]); }

    this.group_of_tag_selected = null;
    //console.log(this.edge_id_group)
    //Tableau contenant les data des tooltips
    this.tooltip_array = [];
    this.iteration_tag = 0;
    this.mouse = {"x":0, "y":0}
    /**************** D3 PART ***************/

    this.width = 900,
    this.height = 900;
    //offset for positioning circle
    this.x_offset = 470;
    this.y_offset = 450;

    this.size_first_image = offset_x + 55;

    this.node_array = nodes_tab;
    this.edge_array = links_tab;

    //console.log("TABSSS", nodes_tab, links_tab)
    //console.log("TABSSS", nodes_tab, links_tab)

    this.drag = d3.behavior.drag()
      .origin(function(d) { return d; })
      .on("dragstart", function () { self.dragstarted(); })
      .on("drag", function () { self.dragged(); })
      .on("dragend",function () {  self.dragended(); });

    this.force = d3.layout.force()
        .size([this.width, this.height]);

    this.force
      .nodes(this.node_array)
      .links(this.edge_array)
      .start();


    this.svg = d3.select("svg")
        .attr("width", this.width)
        .attr("height", this.height)
        .on("click", function() {
          //d3.selectAll('.links_selected').attr("d", '');

        });

    //Cree pour ma selection de liens
    //for (var j=0; j< this.edge_array.length; j++){
    // this.link_selected = this.svg.selectAll(".links_selected")
    //           .data(this.edge_array)
    //         .enter().append("svg:path")
    //           .attr("id", function(d,i) { return "link_selected_"+i;})
    //           .attr("class", "links_selected")
    //           .attr("d", "")
    //}
    // Cree l'edge de l'Hilight vide puis la remplti quand on se rapproche
    this.link_hover = this.svg.selectAll(".links_hover")
            .data([0])
          .enter().append("svg:path")
            .attr("id", "links_hover_1")
            .attr("class", "links_hover")
            .attr("d", "")
    //Cree le tag de l'hilight
    this.tag_hover = this.svg.selectAll(".tags_hover")
            .data([0])
          .enter().append("svg:path")
            .attr("id", "tag_hover_1")
            .attr("class", "tags_hover")
            .attr("d", "")

    //Permet de dessiner les edges
    this.link = this.svg.selectAll(".links")
        .data(this.edge_array)
      .enter().append("svg:path")
        .attr("class", "links")
        .attr("id", function(d) { return "link"+d.id;})
        .on("mouseover", function(){
          var edge_path = d3.select(this).attr("d");
          d3.selectAll('#links_hover_1').attr("d", edge_path);
        })
        .on("mouseout", function(){
          d3.selectAll('#links_hover_1').attr("d", "");
        })
        .on("click", function() {
          //PERMET LA SELECTION MULTIPLE DES EDGES
          console.log("CLICK ON EDGE");

          var link_id = parseInt(d3.select(this).attr("id").slice(4));

          var X = d3.event.pageX - self.size_first_image - 5;
          var Y = d3.event.pageY;
          // Je selectionne un nodes don used est faux et dont le groupe est celui selectionne
          var tools = d3.selectAll(".tool")
          for (var j=0; j< tools[0].length; j++){
            var d = tools[0];
            if (d[j].attributes.used.nodeValue == "false" && d[j].attributes.group.nodeValue == self.group_of_tag_selected){
              console.log(d3.select(d[j]).attr("used","id"));

              var id_Tag = d3.select(d[j]).attr("id");
              console.log(id_Tag)
              //SERT A SAVOIR SI LETIQUETTE NA PAS ETE UTILISE AILLEURS ET SI OUI LA SUPPRIMER DE CE AILLEURS
              var position = is_in_array(self.edge_id_group, id_Tag);
              if (position != undefined){self.edge_id_group[position[0]].splice(position[1], 1);}
              self.remove_other_tag_on_edge(link_id);

              d3.select(d[j]).attr("transform","translate("+X+","+Y+")").attr("used","true");

              self.edge_id_group[link_id] = []
              //PUSH THE ETIQUETTE DANS LA BONNE EDGE
              self.edge_id_group[link_id].push(id_Tag);
              break;
            }
          }

          console.log(self.edge_id_group)

        });




    // PErmet de dessiner les neouds
    this.node = this.svg.selectAll(".node")
      .data(this.node_array)
    .enter().append("circle")
      .attr("class", "node")
      .attr("fill", "#999797")
      .attr("r", 7)
      .attr("cx", function(d) { return (d.x + self.x_offset);})
      .attr("cy", function(d) { return (d.y + self.y_offset );})
      // .attr("cx", function(d,i) {console.log(d.x); return (d.x * 20) + 100; })
      // .attr("cy", function(d) { return (d.y*20) + 400;})
      // .call(this.drag);

      // Permet de dessiner tout les tags
      self.populate_tag();



    this.force.on("tick", function() {
        //self.link.attr("d", function(d) { return draw_curve((d.source.x+self.x_offset), d.source.y +self.y_offset, (d.target.x+self.x_offset), d.target.y+self.y_offset);});
        self.link.attr("d", function(d) {
            var path = draw_curve((d.source.x+self.x_offset), d.source.y +self.y_offset, (d.target.x+self.x_offset), d.target.y+self.y_offset);
            return "M" + path[0].x + "," + path[0].y + "Q" + path[1].x + "," + path[1].y +" " + path[2].x + "," + path[2].y;
        });
        //self.div.attr("transform", "translate(" + 10 + "," + 10 + ")")
        // self.div.attr("cx", function(d, i) {return 10;});
        // self.div.attr("cy", function(d, i) {return 10;});
        // self.div.attr("r", function (d) { return 10; })
        // self.div.style("fill", function(d) { return "blue"; });

        self.force.stop();
    });
}
function is_in_array(array,obj){
  for (var i=0; i< array.length; i++){
    var _array = array[i];
    for (var j=0; j< _array.length; j++){
      if (_array[j] == obj){return [i,j]; }
    }
  }
}
/* Sert a ajouter les tag dans leurs slot */
d3_graph.prototype.populate_tag = function(){
  var self = this;

  this.div = this.svg.selectAll(".tool")
      .data(this.tooltip_array)
  .enter().append("g")
      .attr("transform", function(d, i) {return "translate(" + 10 + "," + self.scale(d.group) + ")";})
      .attr("class", "tool")
      .attr("used", "false")
      .attr("selected", "false")
      .attr("fill-rule","evenodd")
      .attr("group",function(d, i) { return d.group;})
      .attr("id", function(d, i) { return "tooltipdiv"+i;})
      .call(this.drag)


    this.div.append("svg:path")
      //.style("stroke", "black")  // colour the line
      .style("fill", function(d, i) { return self.color(d.group);})
      //.attr("d", "M0,0 L10,-10 L30,-10 L30,10 L10,10z  M6,0 a2 2 0 1 1 0 0.0001 z")
      //.attr("d", "M0,0 L10,-10  h15   a5,5 0 0 1 5,5   v10   a5,5 0 0 1 -5,5   h-15   L10,10z    M6,0 a2 2 0 1 1 0 0.0001 z ")
      .attr("d", "M10,-10 h10   a5,5 0 0 1 5,5   v10   a5,5 0 0 1 -5,5   h-10   l-10,-8   a4,4 0 0 1 0,-4z  m-7,10 a2 2 0 1 1 0 0.0001 z ")


    this.div.append("text")
        .text(function(d, i) { return self.alphabet[d.group];})
        .attr("x", 13)
        .attr("y", 4 )
        .attr("fill", "black" )
        .attr("font-family", "Lato")
        .attr("font-size", "15px")

}
/* Permet de reuperer les tags classes dans le tableau et de les mettre dans l'attribut rank */
/*
edge_id_group = tableau virtuel contenant les tgs sur l'edge en question
*/
d3_graph.prototype.convert_to_group = function(){
  //console.log(this.edge_id_group);
  for (var i=0; i< this.edge_id_group.length; i++){
    var _array = this.edge_id_group[i];
    //LE SUPPRIME AVANT POUR NE PAS QU'IL Y EN AI DEUX
    this.edge_array[i].rank = [];
    for (var j=0; j< _array.length; j++){
      var group = d3.select('#'+_array[j]).attr("group");
      this.edge_array[i].rank.push(group);

    }

  }
}
d3_graph.prototype.remove_other_tag_on_edge = function(i){
  var self = this;

  /**** REMOVE OTHER TAG PRESENT ON THE EDGE *******/
  var others_tag = self.edge_id_group[i];
  for (var k=0; k < others_tag.length; k++)
  {
      console.log("OTHER TAG", others_tag[k])
      var gr = d3.select('#'+ others_tag[k]).attr("group");
      var yo = {"x":10, "y":self.scale(gr)};
      d3.select('#'+ others_tag[k])
        .transition()
        .duration(400)
        .attr("used", "false")
        .attr("transform", "translate(" + yo.x + "," + yo.y + ")");

  }
}
/*
Regarde quelle edge est la plus proche
Et rentre la valeur dans le tableau
 */
d3_graph.prototype.is_close_to_edge = function(x,y) {
  var self = this;

  var find = false;
  var group = d3.select(this.dragObj).attr("group");
  var id = d3.select(this.dragObj).attr("id");
  var touch = {"x":10, "y":self.scale(group)};

  var i_edge = null;
  //console.log("ID DE MON OBJET", id)
  this.link.each(function(d, i) {

      //console.log(i)
      var pathEl = d3.select('#link'+i).node();
      var TotalLength = pathEl.getTotalLength();
      //DISTANCE MINIMALE POUR EVITER RETOUR AU SLOT
      var minimum = 20;
      for (var j=0; j< TotalLength; j++)
      {
          var point = pathEl.getPointAtLength(j);
          var distance = get_distance(point.x, point.y, x, y)

          // Je parcours plusieurs fois toutes les edges
          if (distance < minimum){
            minimum = distance;
            find = true;
            i_edge = i;
            touch.x = point.x;
            touch.y = point.y;
          }
          //break;
          //console.log("GROUP", self.edge_id_group[i])
      }
    });
    //SI IL N'Y A PAS D'EDGE EN DESSOUS
    if (find == false){
      console.log("DRAG RELACHE")
      var position = is_in_array(self.edge_id_group, id);
      if (position != undefined){self.edge_id_group[position[0]].splice(position[1], 1);}
      console.log(position)
    }
    //SI IL Y EN A UNE
    if (find == true){
      //SERT A SAVOIR SI LETIQUETTE NA PAS ETE UTILISE AILLEURS ET SI OUI LA SUPPRIMER DE CE AILLEURS
      var position = is_in_array(self.edge_id_group, id);
      if (position != undefined){self.edge_id_group[position[0]].splice(position[1], 1);}

      console.log("EDGE WINNER IS ", i_edge)
      /**** REMOVE OTHER TAG PRESENT ON THE EDGE *******/
      var others_tag = self.edge_id_group[i_edge];
      // console.log("AUTRES TAGS",i_edge, others_tag)
      for (var k=0; k < others_tag.length; k++)
      {
          //console.log("OTHER TAG", others_tag[k])
          var gr = d3.select('#'+ others_tag[k]).attr("group");
          var yo = {"x":10, "y":self.scale(gr)};
          d3.select('#'+ others_tag[k])
            // .transition()
            // .duration(400)
            .attr("used", "false")
            .attr("transform", "translate(" + yo.x + "," + yo.y + ")");

      }
      self.edge_id_group[i_edge] = []

      /**************************************************/

      //PUSH THE ETIQUETTE DANS LA BONNE EDGE
      self.edge_id_group[i_edge].push(id);
      //console.log("GROUP", self.edge_id_group[i])

    }
    console.log(self.edge_id_group)
    // TRANSLATE THE ETIQUETTE AU BON POINT TROUVE
    // SINON RETOURNE AU SLOT
    d3.select(this.dragObj)
      .transition()
      .duration(300)
      .attr("transform", "translate(" + touch.x + "," + touch.y + ")");

    //Si j'ai effectivement bougé
    if (touch.y != self.scale(group)){d3.select(this.dragObj).attr("used", "true")}
}

/* Hilight l'edge la plus proche */
d3_graph.prototype.hilight_closest_edge = function(x,y) {
  var self = this;
  var group = d3.select(this.dragObj).attr("group");
  var id = d3.select(this.dragObj).attr("id");
  var touch = {"x":10, "y":self.scale(group)};
  var edge_selected = null;

  this.link.each(function(d, i) {
      var pathEl = d3.select('#link'+i).node();
      var TotalLength = pathEl.getTotalLength();
      //DISTANCE MINIMALE POUR EVITER RETOUR AU SLOT
      var minimum = 20;
      for (var j=0; j< TotalLength; j++){
          var point = pathEl.getPointAtLength(j);
          var distance = get_distance(point.x, point.y, x, y)
          if (distance < minimum){
            minimum = distance;
            touch.x = point.x;
            touch.y = point.y;
            edge_selected = i;
          }
      }
    });
    // Hilight l'edge de couleur differente
    // d3.selectAll('.links').attr("class", "links");
    // d3.select('#link'+edge_selected).attr("class", "links hilighted");
    d3.selectAll('#links_hover_1').attr("d", '');
    if (edge_selected != null){
      var edge_path = d3.select('#link'+edge_selected).attr("d");
      d3.selectAll('#links_hover_1').attr("d", edge_path);
    }

}

d3_graph.prototype.dragstarted = function() {
  this.dragObj = d3.event.sourceEvent.target;
  this.dragObj = this.dragObj.parentNode;
  //console.log(this.dragObj)
  d3.event.sourceEvent.stopPropagation();
  d3.select(this.dragObj).classed("dragging", true);

  var X = d3.event.sourceEvent.pageX - this.size_first_image - 5;
  var Y = d3.event.sourceEvent.pageY ;
  this.mouse = {"x":X , "y":Y};
  console.log(this.mouse)
}

d3_graph.prototype.dragged = function() {
  //console.log(d3.event.sourceEvent)
  // d3.select(this.dragObj).attr("cx", d3.event.sourceEvent.pageX - this.size_first_image - 5 );
  // d3.select(this.dragObj).attr("cy", d3.event.sourceEvent.pageY - 85);
  var X = d3.event.sourceEvent.pageX - this.size_first_image - 5;
  var Y = d3.event.sourceEvent.pageY ;
  d3.select(this.dragObj).attr("transform", "translate(" + X + "," + Y + ")")

  this.hilight_closest_edge(X,Y);
  //console.log(get_distance(this.mouse.x,this.mouse.y,X,Y))
  // d3.select(this.dragObj).attr("cx", d3.event.sourceEvent.pageX - this.size_first_image - 5 );
  // d3.select(this.dragObj).attr("cy", d3.event.sourceEvent.pageY - 85);
}

d3_graph.prototype.dragended = function(d) {
  var self = this;
  d3.select(this.dragObj).classed("dragging", false);
  // POUR ENLEVER L'HILIGHT DE L'EDGE SELECTIONNE
  // d3.selectAll('.links').attr("class", "links");
  d3.selectAll('#links_hover_1').attr("d", '');
  var X = d3.event.sourceEvent.pageX - this.size_first_image - 5;
  var Y = d3.event.sourceEvent.pageY;
  //console.log(X2, Y2, X,Y)
  this.is_close_to_edge(X,Y);



  // Si je ne me deplace pas beaucoup alors c'est que j'ai clique sur le boutton
  // Du coup je prend un drag pour ca.
  // X et Y correspondent au dragstart
  console.log("DISTANCE", get_distance(this.mouse.x,this.mouse.y,X,Y))
  console.log("MON X vaut", X)
  if (get_distance(this.mouse.x,this.mouse.y,X,Y) < 90){

      //Si le tag est dragé
      if (d3.select(this.dragObj).attr("selected") == "true") {
        // JE DESELECTIONNE LE TRUC
        d3.select(this.dragObj).attr("selected","false");
        d3.selectAll('#tag_hover_1').attr("d", "");
        this.group_of_tag_selected = null;
      }
      else if (d3.select(this.dragObj).attr("selected") == "false") {
        // JE SELECTIONNE LE TRUC
        //console.log(X+this.size_first_image + 5,Y);
        //Pour etre sur de ne pas prendre tag qui sont deja sur les edges

        if ( X < 90 && X > 0){
          d3.selectAll(".tool").attr("selected","false");
          console.log(this.dragObj)
          d3.select(this.dragObj).attr("selected","true");
          this.group_of_tag_selected = d3.select(this.dragObj).attr("group");
          //console.log("GROUPE SELECTIONNE", this.group_of_tag_selected)
          var touch = {"x":10, "y":self.scale(this.group_of_tag_selected)};

          var translate = d3.select(this.dragObj).attr("transform");
          var tag_path = d3.select(this.dragObj).select("path").attr("d");
          d3.selectAll('#tag_hover_1')
          //.attr("d", tag_path)
          .attr("d", "M0,10 l40,0 l0,-20 l-40,0    z ")
          .attr("transform", "translate(" + touch.x + "," + touch.y + ")");
        }

        // .attr("d", "M0,10 l40,0 l0,-20 l-40,0    z ")
      }

   }



}
d3_graph.prototype.has_all_edge = function(){
  var object = {"no_classified":0, "all_edges":this.edge_id_group.length, "edges_no_tagged":[]};
  var no_classified = 0;
  console.log("EDGE GROUPE", this.edge_id_group);
  for (var i=0; i< this.edge_id_group.length; i++){
    if (this.edge_id_group[i].length == 0){
      object.no_classified += 1;
      object.edges_no_tagged.push(i);
    }
  }
  console.log("YOOOO")
  // PERMET DE COLORER L'EDGE QUI N'A PAS ETE TAGE
  // POUR CAROLINE
  for (var i=0; i< object.edges_no_tagged.length; i++){
    //console.log(object.edges_no_tagged[i])
    d3.select("#link"+object.edges_no_tagged[i]).style("stroke",d3.rgb(31, 119, 180));
  }
  //console.log(object)
  return object;
}



function get_orienttion(Ax, Ay, Bx, By){
  var signe = -1;
  if ( Ax<Bx ){signe = 1;}
  if ( Ay>By ){signe *= -1;}

  return signe;
}

function draw_curve(Ax, Ay, Bx, By) {

    //console.log(Ax, Ay, Bx, By)
    M = get_distance(Ax, Ay, Bx, By) / 4;
    var signe = -1;
    //if ( Ax<Bx ){signe = 1;}
    //if ( Ay>By ){signe *= -1;}
    //if ( By<Ay ){signe *= -1;}
    M *= signe;
    // side is either 1 or -1 depending on which side you want the curve to be on.
    // Find midpoint J
    var Jx = Ax + (Bx - Ax) / 2
    var Jy = Ay + (By - Ay) / 2

    // We need a and b to find theta, and we need to know the sign of each to make sure that the orientation is correct.
    var a = Bx - Ax
    var asign = (a < 0 ? -1 : 1)
    var b = By - Ay
    var bsign = (b < 0 ? -1 : 1)
    var theta = Math.atan(b / a)

    // Find the point that's perpendicular to J on side
    var costheta = asign * Math.cos(theta)
    var sintheta = asign * Math.sin(theta)

    // Find c and d
    var c = M * sintheta
    var d = M * costheta

    // Use c and d to find Kx and Ky
    var Kx = Jx - c
    var Ky = Jy + d

    return [{"x":Ax,"y": Ay}, {"x":Kx, "y":Ky}, {"x":Bx, "y":By}]
    //return "M" + Ax + "," + Ay +
    //       "Q" + Kx + "," + Ky +
     //      " " + Bx + "," + By
}
/* Get the distance between two points */
function get_distance(x1, y1, x2, y2){
    var a = x1 - x2
    var b = y1 - y2

    var c = Math.sqrt( a*a + b*b );
    //console.log(c)
    return c;
}
