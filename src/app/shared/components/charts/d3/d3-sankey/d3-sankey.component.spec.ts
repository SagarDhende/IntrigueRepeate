import { ComponentFixture, TestBed } from '@angular/core/testing';

import { D3SankeyComponent } from './d3-sankey.component';

describe('D3SankeyComponent', () => {
  let component: D3SankeyComponent;
  let fixture: ComponentFixture<D3SankeyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ D3SankeyComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(D3SankeyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
