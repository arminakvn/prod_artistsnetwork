(function() {
  define(["js/app", "tpl!js/apps/org_app/show/templates/show_view.tpl"], function(App, showTpl) {
    App.module("OrgApp.View", function(View, App, Backbone, Marionette, $, _) {
      return View.ShowView = Marionette.Layout.extend({
        template: showTpl,
        id: "organization-region",
        tagName: "div",
        onDomRefresh: function() {},
        initialize: function() {},
        onShow: function() {
          var i, nodes, t_links, t_nodes, _links, _nodes;
          console.log("collection", this.collection);
          nodes = [];
          this.collection.models.forEach(function(model) {
            return nodes.push(model.attributes);
          });
          console.log("nodes", nodes);
          _links = nodes;
          _links.sort(function(a, b) {
            if (a.source > b.source) {
              return 1;
            } else if (a.source < b.source) {
              return -1;
            } else {
              if (a.target > b.target) {
                return 1;
              }
              if (a.target < b.target) {
                return -1;
              } else {
                return 0;
              }
            }
          });
          i = 0;
          while (i < _links.length) {
            if (i !== 0 && _links[i].source === _links[i - 1].source && _links[i].target === _links[i - 1].target) {
              _links[i].linknum = _links[i - 1].linknum + 1;
            } else {
              _links[i].linknum = 1;
            }
            i++;
          }
          _nodes = {};
          _links.forEach(function(link) {
            link.source = _nodes[link.source] || (_nodes[link.source] = {
              name: link.source,
              value: 0,
              group: 0
            });
            link.target = _nodes[link.target] || (_nodes[link.target] = {
              name: link.target,
              group: link.group,
              lat: link.lat,
              long: link.long,
              value: 1
            });
          });
          d3.values(_nodes).forEach((function(_this) {
            return function(sourceNode) {
              _links.forEach(function(link) {
                if (link.source.name === sourceNode.name && link.target.name !== sourceNode.name) {
                  link.target.value += 1;
                }
              });
            };
          })(this));
          t_nodes = _nodes;
          t_links = _links;
          this.draw(t_nodes, t_links);
          return {
            level2Data: function() {
              return this.collection.models.forEach((function(_this) {
                return function(model) {
                  var updateCollection;
                  console.log("mosdel", model.attributes.target.name.replace(/^\s+|\s+$/g, ""));
                  updateCollection = $.ajax('/artstsby/' + model.attributes.target.name.replace(/^\s+|\s+$/g, "", {
                    type: 'GET',
                    dataType: 'json',
                    error: function(jqXHR, textStatus, errorThrown) {
                      return console.log("error", textStatus, errorThrown);
                    },
                    success: function(data, textStatus, jqXHR) {
                      console.log("data!!", data);
                      return data;
                    }
                  }));
                  return $.when(updateCollection).done(function(resB) {
                    var color, j, link, linkedByIndex, node, optArray, padding, tick, tlinks, tnodes, toggle;
                    console.log("updateCollection", resB);
                    nodes = [];
                    resB.forEach(function(model) {
                      return nodes.push(model);
                    });
                    console.log("nodes", nodes);
                    _links = nodes;
                    _links.sort(function(a, b) {
                      if (a.source > b.source) {
                        return 1;
                      } else if (a.source < b.source) {
                        return -1;
                      } else {
                        if (a.target > b.target) {
                          return 1;
                        }
                        if (a.target < b.target) {
                          return -1;
                        } else {
                          return 0;
                        }
                      }
                    });
                    i = 0;
                    while (i < _links.length) {
                      if (i !== 0 && _links[i].source === _links[i - 1].source && _links[i].target === _links[i - 1].target) {
                        _links[i].linknum = _links[i - 1].linknum + 1;
                      } else {
                        _links[i].linknum = 1;
                      }
                      i++;
                    }
                    _nodes = {};
                    _links.forEach(function(link) {
                      link.source = _nodes[link.source] || (_nodes[link.source] = {
                        name: link.source,
                        value: 0,
                        group: 0
                      });
                      link.target = _nodes[link.target] || (_nodes[link.target] = {
                        name: link.target,
                        group: link.group,
                        lat: link.lat,
                        long: link.long,
                        value: 1
                      });
                    });
                    d3.values(_nodes).forEach(function(sourceNode) {
                      _links.forEach(function(link) {
                        if (link.source.name === sourceNode.name && link.target.name !== sourceNode.name) {
                          link.target.value += 1;
                        }
                      });
                    });
                    t_nodes = _nodes;
                    t_links = _links;
                    _this.width = _this.el.clientWidth;
                    _this.height = $('#bio-region').innerHeight() - $('#header').innerHeight() - $('#statelist').innerHeight();
                    padding = .5;
                    color = _this.color = d3.scale.category10();
                    tnodes = _this.force.nodes(d3.values(t_nodes));
                    tlinks = _this.force.links();
                    console.log("@_links", t_links);
                    link = _this.svg.selectAll('.link').data(t_links, function(d) {
                      return d._id;
                    });
                    link.exit().remove();
                    console.log("node in orf ri", node);
                    node = _this.vis.selectAll('g.node').data(d3.values(t_nodes), function(d) {
                      return d.name;
                    });
                    node.exit().remove();
                    node.transition().duration(750).delay(function(d, i) {
                      return i * 5;
                    });
                    tick = function(e) {
                      link.attr('x1', function(d) {
                        return d.source.x;
                      }).attr('y1', function(d) {
                        return d.source.y;
                      }).attr('x2', function(d) {
                        return d.target.x;
                      }).attr('y2', function(d) {
                        return d.target.y;
                      });
                      node.attr('transform', function(d) {
                        var x, y;
                        x = d.x;
                        y = d.y;
                        return 'translate(' + x + ',' + y + ')';
                      });
                    };
                    optArray = [];
                    j = 0;
                    while (j < d3.values(t_nodes) - 1) {
                      optArray.push(d3.values(t_nodes)[j].name);
                      j++;
                    }
                    optArray = optArray.sort();
                    toggle = 0;
                    linkedByIndex = {};
                    j = 0;
                    while (j < d3.values(t_nodes).length) {
                      linkedByIndex[j + ',' + j] = 1;
                      j++;
                    }
                    t_links.forEach(function(d) {
                      linkedByIndex[d.source.index + ',' + d.target.index] = 1;
                    });
                    return node.append('text').style("font-family", "Gill Sans").attr('fill', function(d) {
                      return d3.lab(color(d.group)).darker(2);
                    }).attr("opacity", 0.3).attr('x', 14).attr('dy', '.35em').text(function(d) {
                      return d.name;
                    });
                  });
                };
              })(this));
            }
          };
        },
        draw: function(t_nodes, t_links) {
          var color, j, link, linkedByIndex, node, nodeEnter, optArray, padding, searchNode, tick, tlinks, tnodes, toggle;
          console.log("collection", this.collection);
          this.width = this.el.clientWidth;
          this.height = $('#bio-region').innerHeight() - $('#header').innerHeight() - $('#statelist').innerHeight();
          padding = .5;
          color = this.color = d3.scale.category10();
          this.svg = this.vis = d3.select('#organization-region').append('svg:svg').attr('width', this.width).attr('height', this.height);
          this.force = d3.layout.force().gravity(.5).linkDistance(475).charge(-550).linkStrength(0.4).friction(0.8).size([this.width, this.height]).on("tick", tick);
          console.log("link and source", t_links, t_nodes);
          tnodes = this.force.nodes(d3.values(t_nodes));
          tlinks = this.force.links();
          console.log("@_links", t_links);
          link = this.svg.selectAll('.link').data(t_links, function(d) {
            return d._id;
          });
          link.enter().insert("line", ".node").attr("class", "link").style("stroke", "lightgray").style("stroke-width", function(d, i) {
            return Math.sqrt(d.target.value);
          }).style("opacity", 0.4);
          link.exit().remove();
          console.log("node in orf ri", node);
          node = this.vis.selectAll('g.node').data(d3.values(t_nodes), function(d) {
            return d.name;
          });
          nodeEnter = node.enter().append('g').attr('class', 'node').attr("x", 14).attr("dy", "1.35em").call(this.force.drag);
          nodeEnter.append('circle').property("id", (function(_this) {
            return function(d, i) {
              return "node-" + i;
            };
          })(this)).attr('r', function(d) {
            if (d.group === 2) {
              return Math.sqrt(d.value) * 4;
            } else {
              return 4;
            }
          }).attr('x', '-1px').attr('y', '10px').attr('width', '4px').attr('height', '4px').style("stroke", (function(_this) {
            return function(d) {
              return '2px' + _this.color(d.group);
            };
          })(this)).style("opacity", 0.6).style('fill', (function(_this) {
            return function(d) {
              return _this.color(d.group);
            };
          })(this)).on('mouseover', function(d, i) {}).on('mouseout', function(d, i) {}).on('touchstart', function(d, i) {}).on('touchend', function(d, i) {}).call(this.force.drag);
          node.exit().remove();
          node.transition().duration(750).delay(function(d, i) {
            return i * 5;
          });
          tick = function(e) {
            link.attr('x1', function(d) {
              return d.source.x;
            }).attr('y1', function(d) {
              return d.source.y;
            }).attr('x2', function(d) {
              return d.target.x;
            }).attr('y2', function(d) {
              return d.target.y;
            });
            node.attr('transform', function(d) {
              var x, y;
              x = d.x;
              y = d.y;
              return 'translate(' + x + ',' + y + ')';
            });
          };
          this.force.on('tick', tick).start();
          optArray = [];
          j = 0;
          while (j < d3.values(t_nodes) - 1) {
            optArray.push(d3.values(t_nodes)[j].name);
            j++;
          }
          optArray = optArray.sort();
          toggle = 0;
          linkedByIndex = {};
          j = 0;
          while (j < d3.values(t_nodes).length) {
            linkedByIndex[j + ',' + j] = 1;
            j++;
          }
          t_links.forEach(function(d) {
            linkedByIndex[d.source.index + ',' + d.target.index] = 1;
          });
          node.append('text').style("font-family", "Gill Sans").attr('fill', function(d) {
            return d3.lab(color(d.group)).darker(2);
          }).attr("opacity", 0.5).attr('x', 16).attr('dy', '.35em').text(function(d) {
            return d.name;
          });
          node.on('click', function(d, i) {
            var neighboring;
            neighboring = function(a, b) {
              return linkedByIndex[a.index + ',' + b.index];
            };
            if (toggle === 0) {
              d = d3.select(this).node().__data__;
              node.selectAll("circle").transition(100).style('opacity', function(o) {
                if (neighboring(d, o) | neighboring(o, d)) {
                  return 1;
                } else {
                  return 0.1;
                }
              });
              node.selectAll("text").transition(100).style('opacity', function(o) {
                if (neighboring(d, o) | neighboring(o, d)) {
                  return 1;
                } else {
                  return 0.2;
                }
              }).style('font-size', function(o) {
                if (neighboring(d, o) | neighboring(o, d)) {
                  return 20;
                } else {
                  return 12;
                }
              });
              link.transition(100).style('opacity', function(o) {
                if (d.index === o.source.index | d.index === o.target.index) {
                  return 1;
                } else {
                  return 0.1;
                }
              });
              toggle = 1;
            } else {
              node.selectAll("circle").transition(100).style('opacity', 0.6);
              link.transition(100).style('opacity', 1);
              node.selectAll("text").transition(100).style('opacity', 0.3).style('font-size', 14);
              App.OrgApp.Show.Controller.resetHighlightNodesBy(d);
              toggle = 0;
            }
          });
          return searchNode = function() {
            var selected;
            node = this.evis.selectAll('g.node');
            if (selectedVal === 'none') {
              node.style('stroke', 'white').style('stroke-width', '1');
            } else {
              selected = node.filter(function(d, i) {
                return d.name !== selectedVal;
              });
              selected.style('opacity', '0');
              link = this.svg.selectAll('.link');
              link.style('opacity', '0');
              d3.selectAll('.node, .link').transition().duration(3000).style('opacity', 1);
            }
          };
        }
      });
    });
    return App.OrgApp.View;
  });

}).call(this);
