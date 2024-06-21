import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';

@Component({
  selector: 'app-custom-menu',
  templateUrl: './custom-menu.component.html',
  styleUrl: './custom-menu.component.scss'
})
export class CustomMenuComponent implements OnInit{

  constructor(private route:ActivatedRoute){}
  protected isURLReady:boolean=false;
  protected url:any
  ngOnInit(): void {
    this.route.paramMap.subscribe({
      next:(param:ParamMap)=>{
        console.log(param);
        this.url=atob(param.get("url"));
        this.isURLReady=false;
        setTimeout(()=>{
          this.isURLReady=true;
        }, 1000) 
      }
    })
  }
}
