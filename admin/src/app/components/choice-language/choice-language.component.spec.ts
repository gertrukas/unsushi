import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChoiceLanguageComponent } from './choice-language.component';

describe('ChoiceLanguageComponent', () => {
  let component: ChoiceLanguageComponent;
  let fixture: ComponentFixture<ChoiceLanguageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChoiceLanguageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChoiceLanguageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
