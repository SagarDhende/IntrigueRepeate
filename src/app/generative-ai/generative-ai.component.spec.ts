import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerativeAiComponent } from './generative-ai.component';

describe('GenerativeAiComponent', () => {
  let component: GenerativeAiComponent;
  let fixture: ComponentFixture<GenerativeAiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenerativeAiComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GenerativeAiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
