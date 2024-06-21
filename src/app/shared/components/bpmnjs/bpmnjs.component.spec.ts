import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BpmnjsComponent } from './bpmnjs.component';

describe('BpmnjsComponent', () => {
  let component: BpmnjsComponent;
  let fixture: ComponentFixture<BpmnjsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BpmnjsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BpmnjsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
