import { AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import * as d3Sankey from 'd3-sankey';
import * as d3Selection from 'd3-selection';
import * as d3Scale from 'd3-scale';
import * as d3ScaleChromatic from 'd3-scale-chromatic';
import * as d3Format from 'd3-format';
import { Subscriber, Subscription } from 'rxjs';
import { SubjectService } from 'src/app/shared/services/subject.service';

@Component({
  selector: 'app-d3-sankey',
  templateUrl: './d3-sankey.component.html',
  styleUrls: ['./d3-sankey.component.scss']
})
export class D3SankeyComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() sankey: any;
  @ViewChild('sankey') private chartContainer: ElementRef;
  chart: any;
  private margin: any = { top: 20, bottom: 20, left: 20, right: 20 };
  private width: number;
  private height: number;
  private colorScale = d3Scale.scaleOrdinal(d3ScaleChromatic.schemeCategory10);
  // Array For Unsubscription Of Observable
  subscriptions: Subscription[] = [];
  @Input() alignment = 'Justify';
  @Input() nodeWidth = 15;
  @Input() nodePadding = 10;
  constructor(private subjectShareService: SubjectService) { }
  ngAfterViewInit(): void {
    this.createChart();
    // const observableTemp = this.subjectShareService.themeBehaviour.asObservable().subscribe({
    //   next: (res: any) => {
    //     this.updateChart(res.bodyBackground);
    //   }
    // });
    // this.addSubscribe(observableTemp);
    this.sankey = this.convertGraphpdResultToVizjs(this.sankey);
    for (let i = 0; i < this.sankey.edges.length; i++) {
      this.sankey.edges[i].source = this.getNodesIndex(
        this.sankey.nodes,
        this.sankey.edges[i].source1
      );
      this.sankey.edges[i].target = this.getNodesIndex(
        this.sankey.nodes,
        this.sankey.edges[i].target1
      );
    }
    this.updateChart({bodyBackground:"#FFFF"});
  
  }

  ngOnInit(): void {
    // this.sankey.nodes = this.sankey.nodes.filter((obj, pos, arr) => {
    //   return arr.map((mapObj) => mapObj.id).indexOf(obj.id) == pos;
    // });
  }
  private convertGraphpdResultToVizjs(data) {
    var nodeArray = [];
    var edgeArray = [];
    var colors = {
      'envirement': '#edbd00',
      'social': '#367d85',
      'animals': '#97ba4c',
      'health': '#f5662b',
      'research_ingredient': '#3f3e47',
      'fallback': '#ffffff'
    };
    if (data != null) {

      if (data.edges != null) {
        var vizEdgeArray = [];
        // if (edges)
        //   vizEdgeArray = edges.get();
        var tempEdges = data.edges;
        for (var i = 0; i < tempEdges.length; i++) {
          var edgeInfo: any = {};
          for (var j = 0; j < tempEdges.length; j++) {
            if (tempEdges[i].targetDisplayId == tempEdges[j].sourceDisplayId && tempEdges[i].sourceDisplayId == tempEdges[j].targetDisplayId) {
              let temp = { ...data.nodes[this.getNodesIndex(data.nodes, tempEdges[j].targetDisplayId)] }
              if (temp != -1) {
                temp.id = i.toString();
                temp.nodeName = i.toString();
                tempEdges[j].id = i.toString();
                tempEdges[j].target1 = i.toString();
                tempEdges[j].targetDisplayId = i.toString();
                nodeArray.push(
                  temp
                )
                break;
              }
            }
          }
          var index = this.isItemIdExist(vizEdgeArray, tempEdges[i].targetDisplayId, "targetDisplayId")
          if (index == -1) {
            edgeInfo.value = tempEdges[i].value != "" ? Math.round(tempEdges[i].value) : 0;
            var index = this.isItemIdExist(nodeArray, tempEdges[i].sourceDisplayId, "id");
            if (index == 0) {
              colors[tempEdges[i].sourceDisplayId] = "#edbd00";
            }
            edgeInfo = tempEdges[i]
            edgeInfo.source1 = tempEdges[i].sourceDisplayId //isItemIdExist(nodeArray, tempEdges[i].sourceDisplayId, "id"); //Number(tempEdges[i].sourceDisplayId);
            edgeInfo.target1 = tempEdges[i].targetDisplayId //isItemIdExist(nodeArray, tempEdges[i].targetDisplayId, "id")//Number(tempEdges[i].targetDisplayId);
            // edgeInfo.edgeProperties = tempEdges[i].edgeProperties;
            //  edgeInfo.edgeName = tempEdges[i].edgeName;
            //edgeInfo.edgeType = tempEdges[i].edgeType;
            edgeArray.push(edgeInfo);
          }
        }
      }

      if (data.nodes != null) {
        var nodes = data.nodes;
        for (var i = 0; i < nodes.length; i++) {
          if (this.isItemIdExist(nodeArray, nodes[i].id, "id") == -1) {
            var nodeInfo: any = {};
            nodeInfo.id = nodes[i].id

            nodeInfo.name = nodes[i].nodeName;
            nodeInfo.type = nodes[i].nodeName;
            nodeInfo.number = 5
            nodeInfo = nodes[i]
            nodeArray.push(nodeInfo);
          }
        }
      }
    }
    return { nodes: nodeArray, edges: edgeArray };
  }
  private isItemIdExist(_array, value, key) {
    var _found = -1;
    if (_array != null && _array.length > 0) {
      _found = _array.findIndex(function (item, index) {
        if (item[key] == value)
          return true;
      });
    }
    return _found;
  }
  private getNodesIndex(jsonObject, key) {
    return jsonObject
      .map(function (x) {
        return x.id;
      })
      .indexOf(key);
  }
  private generateData() {
    let element = this.chartContainer.nativeElement;
    const width = element.offsetWidth,
      height = element.offsetHeight;

    const alignMethod = d3Sankey[`sankey${this.alignment}`];
    const sankeyGeneratorFn = d3Sankey
      .sankey()
      .nodeAlign(alignMethod)
      .nodeWidth(this.nodeWidth)
      .nodePadding(this.nodePadding)
      .extent([
        [20, 20],
        [
          width - this.margin.left - this.margin.right,
          height - this.margin.top - this.margin.bottom,
        ],
      ]);

    return ({ nodes, links }) =>
      sankeyGeneratorFn({
        nodes: nodes.map((d) => Object.assign({}, d)),
        links: links.map((d) => Object.assign({}, d)),
      });
  }

  private createChart() {
    let element = this.chartContainer.nativeElement;
    this.width = element.offsetWidth - this.margin.left - this.margin.right;
    this.height = element.offsetHeight - this.margin.top - this.margin.bottom;

    let svg = d3Selection
      .select(element)
      .append('svg')
      .attr('width', element.offsetWidth)
      .attr('height', element.offsetHeight);

    // chart plot area
    this.chart = svg
      .append('g')
      .attr('class', 'sankey')
      .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);
  }

  private updateChart(res) {
    const { nodes, links } = this.generateData()({
      nodes: this.sankey.nodes,
      links: this.sankey.edges,
    });
    this.drawNodes(nodes);
    this.drawLinks(links, res);
    this.drawLinkLabels(nodes, links, res);
  }

  private drawNodes(nodes: Array<any>) {
    this.chart
      .append('g')
      .attr('stroke', '#000')
      .selectAll('rect')
      .data(nodes)
      .join('rect')
      .attr('x', (d) => d.x0)
      .attr('y', (d) => d.y0)
      .attr('height', (d) => d.y1 - d.y0)
      .attr('width', (d) => d.x1 - d.x0)
      .attr('fill', (d, i) => this.color(d.id, i))
      .append('title')
      .text((d) => `${d.label}\n${this.format(d.value)}`);
  }

  private drawLinks(links: Array<any>, theme: any) {
    let bgColor = "#000";
    // console.log(theme)
    var link = this.chart
      .append('g')
      .attr('class', 'links')
      .attr('fill', 'none')
      .attr('stroke-opacity', 0.5)
      .selectAll('g')
      .data(links)
      .join('g')
      .attr('class', 'link')
      .style('mix-blend-mode', 'multiply');
    if (theme == 'body-dark') {
      bgColor = "#fff";
      link = this.chart
        .append('g')
        .attr('class', 'links')
        .attr('fill', 'none')
        .attr('stroke-opacity', 0.5)
        .selectAll('g')
        .data(links)
        .join('g')
        .attr('class', 'link');
    }
    else if (theme == 'body-light') {
      bgColor = "#000";
      link = this.chart
        .append('g')
        .attr('class', 'links')
        .attr('fill', 'none')
        .attr('stroke-opacity', 0.5)
        .selectAll('g')
        .data(links)
        .join('g')
        .attr('class', 'link')
        .style('mix-blend-mode', 'multiply');
    }
    const edgeColor = 'none';
    link
      .append('path')
      .attr('d', d3Sankey.sankeyLinkHorizontal())
      .attr('stroke', (d, i) => {
        return edgeColor === 'none'
          ? bgColor
          : edgeColor === 'path'
            ? d.uid
            : edgeColor === 'input'
              ? this.color(d.sourceDisplayId)
              : this.color(d.targetDisplayId);
      })
      .attr('stroke-width', (d) => Math.max(1, d.width));

    link
      .append('title')
      .text(
        (d) =>
          `${d.source.label} ? ${d.target.label}\n${d3Format.format(
            d.value
          )}`
      );
  }

  private drawLinkLabels(nodes, links, theme) {
    let textColor = "#000";
    if (theme == 'body-dark') {
      textColor = "#fff";
    }
    this.chart
      .selectAll('g.link')
      .append('title')
      .text(
        (d) =>
          `${d.sourceDisplayId.label} ? ${d.targetDisplayId.label
          }\n${this.format(d.label)}`
      );

    this.chart
      .append('g')
      .style('font', '10px sans-serif')
      .selectAll('text')
      .data(nodes)
      .join('text')
      .attr('x', (d) => (d.x0 < this.width / 2 ? d.x1 + 6 : d.x0 - 6))
      .attr('y', (d) => (d.y1 + d.y0) / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', (d) => (d.x0 < this.width / 2 ? 'start' : 'end'))
      .text((d) => d.label)
      .style('fill', textColor);
  }

  get color() {
    return (name, i?) => {
      const colorCode = this.colorScale(name.replace(/ .*/, ''));
      return colorCode;
    };
  }

  get format() {
    const f = d3Format.format(',.0f');
    return (d) => `${f(d)}`;
  }

  private addSubscribe(subscriber:any):void {
    if(subscriber!=null && subscriber instanceof Subscriber){     
      this.subscriptions.push(subscriber);
    }
  }


  ngOnDestroy(): void {
    // Method for Unsubscribing Observable
     for (let subscription of this.subscriptions) {
        subscription.unsubscribe();
      }
  }

}
