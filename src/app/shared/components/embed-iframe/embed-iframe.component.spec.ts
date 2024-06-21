import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmbedIframeComponent } from './embed-iframe.component';

describe('EmbedIframeComponent', () => {
  let component: EmbedIframeComponent;
  let fixture: ComponentFixture<EmbedIframeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmbedIframeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmbedIframeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
