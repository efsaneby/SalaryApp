import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateScale } from './create-scale';

describe('CreateScale', () => {
  let component: CreateScale;
  let fixture: ComponentFixture<CreateScale>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateScale]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateScale);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
