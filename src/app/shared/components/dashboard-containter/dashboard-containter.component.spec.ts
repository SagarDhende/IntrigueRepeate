import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardContainterComponent } from './dashboard-containter.component';

describe('DashboardContainterComponent', () => {
  let component: DashboardContainterComponent;
  let fixture: ComponentFixture<DashboardContainterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardContainterComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DashboardContainterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
