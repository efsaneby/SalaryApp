import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkEntryModal } from './work-entry-modal';

describe('WorkEntryModal', () => {
  let component: WorkEntryModal;
  let fixture: ComponentFixture<WorkEntryModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkEntryModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkEntryModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
