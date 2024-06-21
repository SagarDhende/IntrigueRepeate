import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardEmbedContainerComponent } from './dashboard-embed-container.component';

describe('DashboardEmbedContainerComponent', () => {
  let component: DashboardEmbedContainerComponent;
  let fixture: ComponentFixture<DashboardEmbedContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DashboardEmbedContainerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardEmbedContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
