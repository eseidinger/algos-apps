import { Component } from '@angular/core';
import { loadPyodide, PyodideInterface } from 'pyodide';

@Component({
  selector: 'app-complexity',
  imports: [],
  templateUrl: './complexity.component.html',
  styleUrl: './complexity.component.scss'
})
export class ComplexityComponent {
  pyodide!: PyodideInterface;

  async ngOnInit() {
    this.pyodide = await loadPyodide({ indexURL: '/' });
    console.log(this.pyodide.runPython(`
        import sys
        sys.version
      `));
    await this.pyodide.loadPackage("https://files.pythonhosted.org/packages/43/e3/7d92a15f894aa0c9c4b49b8ee9ac9850d6e63b03c9c32c0367a13ae62209/mpmath-1.3.0-py3-none-any.whl");
    await this.pyodide.loadPackage("https://files.pythonhosted.org/packages/99/ff/c87e0622b1dadea79d2fb0b25ade9ed98954c9033722eb707053d310d4f3/sympy-1.13.3-py3-none-any.whl");
    await this.pyodide.loadPackage("https://test-files.pythonhosted.org/packages/ed/c8/b4107409c32d9d1aa3ffdcecd1e2bf579fb47d57dc38be3c0bf8768f41f2/py_algos_eseidinger-0.0.1-py3-none-any.whl");

    const pkg = this.pyodide.pyimport('py_algos_eseidinger.complexity.varianttree');
    console.log(pkg.main());
  }

}
