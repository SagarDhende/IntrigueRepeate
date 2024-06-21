import { ComponentFixture, TestBed } from '@angular/core/testing';

import { D3WorldBubbleComponent } from './d3-world-bubble.component';

describe('D3WorldBubbleComponent', () => {
  let component: D3WorldBubbleComponent;
  let fixture: ComponentFixture<D3WorldBubbleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ D3WorldBubbleComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(D3WorldBubbleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
