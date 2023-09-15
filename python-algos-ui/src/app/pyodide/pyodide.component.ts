import { Component, OnInit } from '@angular/core';
import { loadPyodide } from 'pyodide';

@Component({
  selector: 'pau-pyodide',
  templateUrl: './pyodide.component.html',
  styleUrls: ['./pyodide.component.css']
})
export class PyodideComponent implements OnInit {

  async ngOnInit() {
    const pyodide = await loadPyodide();
        console.log(pyodide.runPython(`
            import sys
            sys.version
        `));
        pyodide.runPython("print(1 + 2)");
  }

}
