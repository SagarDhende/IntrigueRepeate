import { AfterViewInit, Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { SubjectService } from 'src/app/shared/services/subject.service';
import * as BpmnJS from 'bpmn-js/dist/bpmn-viewer.production.min.js';



@Component({
  selector: 'app-bpmnjs',
  templateUrl: './bpmnjs.component.html',
  styleUrl: './bpmnjs.component.scss'
})
export class BpmnjsComponent implements OnInit, AfterViewInit, OnDestroy {

  @Input()
  workflow: any;
  @Input()
  theme: any;
  bpmnJS: any;
  @ViewChild('workflow') el: any;
  @Output() private importDone: EventEmitter<any> = new EventEmitter();
  canvas: any;
  overlay: any;


  constructor()
  {

  }

  ngOnChanges(changes: SimpleChanges): void {
    // console.log(changes['theme'].currentValue.bodyBackground)
     this.canvas = undefined;
     this.overlay = undefined;
    this.bpmnJS = undefined;
    // if (changes.theme.currentValue.bodyBackground == 'body-dark') {
    //   this.bpmnJS = new BpmnJS({
    //     height: "680px", bpmnRenderer: {
    //       defaultFillColor: '#000',
    //       defaultStrokeColor: '#fff'
    //     },
    //   });
    //   console.log(this.bpmnJS.get('config'))
    // }
    // else {
    //   this.bpmnJS = new BpmnJS({
    //     height: "680px", bpmnRenderer: {
    //       defaultFillColor: '#fff',
    //       defaultStrokeColor: '#000'
    //     },
    //   });
    //   console.log(this.bpmnJS.get('config'))
    // }
    this.bpmnJS = new BpmnJS({
      height: "380px", bpmnRenderer: {
        defaultFillColor: '#fff',
        defaultStrokeColor: '#000'
      },
    });
    this.createWorkflow();
  }
  ngAfterViewInit(): void {
    this.bpmnJS.attachTo(this.el.nativeElement);
  }
  ngOnInit(): void {

    this.bpmnJS.on('import.done', ({ error }) => {
      if (!error) {
        console.log(this.bpmnJS.get('config'))
        console.log('create')
        // this.bpmnJS.get('config').bpmnRenderer = {
        //   defaultFillColor: '#fff',
        //   defaultStrokeColor: '#000'
        // }
        this.bpmnJS.get('canvas').zoom('fit-viewport', 'auto');
      }
    });
  }

  private createWorkflow(): void {
    this.importDone.emit({
      
      type: 'success',
      response: this.workflow.bpmn20Xml
    });
    this.bpmnJS.importXML(this.workflow.bpmn20Xml).then(() => {
      if (this.workflow.taskDefinitionKey != null) {
        this.canvas = undefined;
        this.overlay = undefined;
        this.canvas = this.bpmnJS.get('canvas');
        this.canvas.addMarker(this.workflow.taskDefinitionKey, 'highlight');
        this.bpmnJS.get('canvas').zoom('fit-viewport', 'auto');

        this.overlay = this.bpmnJS.get('overlays');
        this.overlay.add(this.workflow.taskDefinitionKey, {
          position: {
            bottom: 13,
            left: -10
          },
          html: '<span title="Running Activity Instances" class="overlay-badge">1</span>'
        });
      }
    })
  }
  ngOnDestroy(): void {
    this.bpmnJS.destroy();
  }


  
}
