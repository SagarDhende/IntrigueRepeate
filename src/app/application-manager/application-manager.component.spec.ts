import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicationManagerComponent } from './application-manager.component';

describe('ApplicationManagerComponent', () => {
  let component: ApplicationManagerComponent;
  let fixture: ComponentFixture<ApplicationManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApplicationManagerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ApplicationManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
