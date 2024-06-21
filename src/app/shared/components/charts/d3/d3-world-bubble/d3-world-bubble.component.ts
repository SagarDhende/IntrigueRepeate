import { Component, OnInit, ElementRef, ViewEncapsulation } from '@angular/core';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';

@Component({
  selector: 'app-d3-world-bubble',
  templateUrl: './d3-world-bubble.component.html',
  styleUrls: ['./d3-world-bubble.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class D3WorldBubbleComponent implements OnInit {

  private svg;
  private width = 800;
  private height = 600;

  constructor(private el: ElementRef) { }

  ngOnInit(): void {
    this.createSvg();
    this.drawMap();
  }

  private createSvg(): void {
    this.svg = d3.select(this.el.nativeElement)
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height);
  }

  private drawMap(): void {
    // d3.json('/assets/maps_geo/world.json').then((data: any) => {
    //   const countries: any = topojson.feature(data, data.objects.countries);
    //   const projection = d3.geoMercator().fitSize([this.width, this.height], countries);
    //   const path = d3.geoPath().projection(projection);

    //   this.svg.selectAll('path')
    //     .data(countries.features)
    //     .enter().append('path')
    //     .attr('d', path)
    //     .style('fill', 'lightgray')
    //     .style('stroke', 'black');

    //   // Example bubble data: [{longitude: 78.9629, latitude: 20.5937, size: 20}]
    //   const bubbles = [{ longitude: 78.9629, latitude: 20.5937, size: 20 }]; // Add your data here

    //   this.svg.selectAll('circle')
    //     .data(bubbles)
    //     .enter().append('circle')
    //     .attr('cx', d => projection([d.longitude, d.latitude])[0])
    //     .attr('cy', d => projection([d.longitude, d.latitude])[1])
    //     .attr('r', d => d.size)
    //     .style('fill', 'blue')
    //     .style('opacity', 0.6);
    // });
  }

}
