import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScaleList } from './scale-list';

describe('ScaleList', () => {
  let component: ScaleList;
  let fixture: ComponentFixture<ScaleList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScaleList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScaleList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
