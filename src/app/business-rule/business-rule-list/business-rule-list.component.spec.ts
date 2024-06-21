import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusinessRuleListComponent } from './business-rule-list.component';

describe('BusinessRuleListComponent', () => {
  let component: BusinessRuleListComponent;
  let fixture: ComponentFixture<BusinessRuleListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BusinessRuleListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BusinessRuleListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
