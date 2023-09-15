import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PyodideComponent } from './pyodide.component';

describe('PyodideComponent', () => {
  let component: PyodideComponent;
  let fixture: ComponentFixture<PyodideComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PyodideComponent]
    });
    fixture = TestBed.createComponent(PyodideComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
