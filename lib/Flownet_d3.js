
function flownet_d3_graph(graph, svg){
  console.log(graph, svg);
    var lineFunction = d3.line()
                      .x(function(d) { return d.x; })
                      .y(function(d) { return d.y; })
                      .curve(d3.curveBasis)

    for (var index in graph.links) {
      if (!graph.links[index].hasOwnProperty('colorLink')) {
        graph.links[index].colorLink = "#dddddd"
      }
      if (!graph.links[index].hasOwnProperty('sizeLink')) {
        if (!graph.links[index].hasOwnProperty('sizeParticule')) {
            graph.links[index].sizeLink = 12
        }else{
          graph.links[index].sizeLink = graph.links[index].sizeParticule + 8
        }
      }
      if (!graph.links[index].hasOwnProperty('sizeParticule')) {
        graph.links[index].sizeParticule = 4
      }
      if (!graph.links[index].hasOwnProperty('colorParticule')) {
        graph.links[index].colorParticule = "black"
      }
      if (!graph.links[index].hasOwnProperty('patternParticule')) {
        graph.links[index].patternParticule = [10]
      }
      if (!graph.links[index].hasOwnProperty('frequencyParticule')) {
        graph.links[index].frequencyParticule = 10
      }
      if (!graph.links[index].hasOwnProperty('speedParticule')) {
        graph.links[index].speedParticule = 4
      }
      graph.links[index].decalage = graph.links[index].frequencyParticule + graph.links[index].patternParticule.reduce((a, b) => a + b, 0);
    }

    this.links = d3.select('svg').append('g').attr('id', 'links').selectAll('path')
      .data(graph.links)
      .enter()
      .append('path')
      .attr('id',function(d){ return d.id})
      .attr('d', function(d){ return lineFunction(d.points)})
      .attr('fill', 'none')
      .attr('stroke', function(d){ return d.colorLink})
      .attr('stroke-width', function(d){ return d.sizeLink})

    this.particules = d3.select('svg').append('g').attr('id', 'particules').selectAll('path')
      .data(graph.links)
      .enter()
      .append('path')
      .attr('id',function(d){ return d.id})
      .attr('d', function(d){ return lineFunction(d.points)})
      .attr('fill', 'none')
      .attr('stroke', function(d){ return d.colorParticule})
      .attr('stroke-width', function(d){ return d.sizeParticule})
      .attr("stroke-dasharray", function(d){ return d.patternParticule.concat(d.frequencyParticule) })
      .each(function(d){
        startTransition(d3.select(this), d.decalage )
      })

      this.nodes = d3.select('svg').append('g').attr('id', 'nodes').selectAll('circle')
        .data(graph.nodes)
        .enter()
        .append('circle')
        .attr('r', function(d){ return d.r})
        .attr('cx', function(d){ return d.x})
        .attr('cy', function(d){ return d.y})
        .attr('fill', 'black')
}

function startTransition(link, decalage){
  function motionDash(start, offset) {
    link.attr('stroke-dashoffset', start)
      .transition()
        .duration(function(d){
          return 10000* (1/d.speedParticule)
        })
        .ease(d3.easeLinear)
        .attr('stroke-dashoffset', offset)
        .on('end', function() {
          motionDash(start - decalage, offset - decalage);
        });
  }
  motionDash(0, -decalage)
}

flownet_d3_graph.prototype.updateFrequencyPraticule = function(){
  this.particules.attr("stroke-dasharray", function(d){ return d.patternParticule.concat(d.frequencyParticule) })
}
flownet_d3_graph.prototype.updateSpeedPraticule = function(){
  this.particules.each(function(d){
    startTransition(d3.select(this), d.decalage )
  })
}
flownet_d3_graph.prototype.updatePatternPraticule = function(){
  this.particules.attr("stroke-dasharray", function(d){ return d.patternParticule.concat(d.frequencyParticule) })
}
flownet_d3_graph.prototype.updateColorPraticule = function(){
  this.particules.attr('stroke', function(d){ return d.colorParticule})
}
flownet_d3_graph.prototype.updateColorLink = function(){
  this.particules.attr('stroke', function(d){ return d.colorLink})
}
flownet_d3_graph.prototype.updateSizePraticule = function(){
  this.particules.attr('stroke-width', function(d){ return d.sizeParticule})
}
flownet_d3_graph.prototype.updateSizeLink = function(){
  this.links.attr('stroke-width', function(d){ return d.sizeLink})
}
flownet_d3_graph.prototype.bindCallbackOnLink = function(fun, type){
  this.links.on(type, fun)
}
flownet_d3_graph.prototype.bindCallbackOnParticule = function(fun, type){
  this.particules.on(type, fun)
}
