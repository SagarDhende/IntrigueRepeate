import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-create-case',
  standalone: false,
  templateUrl: './create-case.component.html',
  styleUrl: './create-case.component.scss'
})
export class CreateCaseComponent implements OnInit {

  breadcrumb = [{ title: 'Case', url: '/case' }, { title: 'Create Case', url: false }];

  constructor() {

  }

  ngOnInit(): void {

  }

  
}
