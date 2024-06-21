import { ComponentFixture, TestBed } from '@angular/core/testing';

import { C3ChartComponent } from './c3-chart.component';

describe('C3ChartComponent', () => {
  let component: C3ChartComponent;
  let fixture: ComponentFixture<C3ChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [C3ChartComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(C3ChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
