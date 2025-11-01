import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditScale } from './edit-scale';

describe('EditScale', () => {
  let component: EditScale;
  let fixture: ComponentFixture<EditScale>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditScale]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditScale);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
