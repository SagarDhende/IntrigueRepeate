import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardIntegratedContainerComponent } from './dashboard-integrated-container.component';

describe('DashboardIntegratedContainerComponent', () => {
  let component: DashboardIntegratedContainerComponent;
  let fixture: ComponentFixture<DashboardIntegratedContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DashboardIntegratedContainerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardIntegratedContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
