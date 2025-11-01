import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkLog } from './work-log';

describe('WorkLog', () => {
  let component: WorkLog;
  let fixture: ComponentFixture<WorkLog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkLog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkLog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
