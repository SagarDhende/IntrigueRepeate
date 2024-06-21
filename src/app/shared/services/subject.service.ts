import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { AppConfig, LayoutService } from 'src/app/layout/service/app.layout.service';
import { ILogin } from 'src/app/login/auth.model';


@Injectable({
  providedIn: 'root'
})
export class SubjectService {

  public application$ = new BehaviorSubject<any>(null);
  public entity$ = new BehaviorSubject<any>(null);
  public user$   =new Subject<ILogin>();
  public themeBehaviour = new BehaviorSubject<AppConfig>(null);
  public lhsCount$ = new BehaviorSubject<AppConfig>(null)
  
  constructor(){
  }

}