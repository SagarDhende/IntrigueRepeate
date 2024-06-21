import { Component, OnInit } from '@angular/core';
import { SubjectService } from '../shared/services/subject.service';
import { MetaType } from '../shared/enums/api/meta-type.enum';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  protected uuid: string;
  protected isDashboardRender:boolean=false;

  constructor(private subjectService:SubjectService) { }
  
  ngOnInit(): void {
    //this.uuid="3e46128e-482d-4d33-b047-120416dc4b58";
    //this.isDashboardRender=true;
    this.getApplication();
  }

  private getApplication():void{
    this.subjectService.application$.subscribe({
      next:(response:any)=>{
        
        if(response !=null && response.homePage !=null){
          if(response.homePage.ref.type==MetaType.DASHBOARD){
            this.uuid=response.homePage.ref.uuid;
            this.isDashboardRender=true;
          }
        }
      }
    })
  }



}
