import { Component, OnInit } from '@angular/core';
import { loadPyodide, PyodideInterface } from 'pyodide';

@Component({
  selector: 'app-maze',
  imports: [],
  templateUrl: './maze.component.html',
  styleUrl: './maze.component.scss'
})
export class MazeComponent implements OnInit {
  pyodide!: PyodideInterface;

  async ngOnInit() {
    this.pyodide = await loadPyodide({ indexURL: '/' });
    console.log(this.pyodide.runPython(`
      import sys
      sys.version
    `));
    await this.pyodide.runPythonAsync(`
      from pyodide.http import pyfetch
      response = await pyfetch('https://test-files.pythonhosted.org/packages/ed/c8/b4107409c32d9d1aa3ffdcecd1e2bf579fb47d57dc38be3c0bf8768f41f2/py_algos_eseidinger-0.0.1-py3-none-any.whl')
      await response.unpack_archive()
    `);
    const pkg = this.pyodide.pyimport('py_algos_eseidinger.generic_search.maze');
    console.log(pkg.main());
  }
}
