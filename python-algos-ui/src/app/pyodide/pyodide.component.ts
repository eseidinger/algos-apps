import { Component, OnInit } from '@angular/core';
import { PyodideInterface, loadPyodide } from 'pyodide';

@Component({
  selector: 'pau-pyodide',
  templateUrl: './pyodide.component.html',
  styleUrls: ['./pyodide.component.css'],
})
export class PyodideComponent implements OnInit {
  async ngOnInit() {
    const pyodide = await loadPyodide();
    await this.loadFile('/python_algos/ch02/generic_search.py', 'generic_search.py', pyodide);
    await this.loadFile('/python_algos/ch02/maze.py', 'maze.py', pyodide);
    console.log(pyodide.runPython(`
      import maze
      from maze import Maze, MazeLocation
      from generic_search import DFS, node_to_path
      m = Maze()
      dfs = DFS(m.start, m.goal_test, m.successors)
      solution = dfs.solve()
      if solution is None:
        print("No solution found with depth-first search!")
      else:
        path: list[MazeLocation] = node_to_path(solution)
        m.mark(path)
        print(m)
        m.clear(path)
        print(m)
  `));
  }

  // Load a file from an URL and add it to the virtual filesystem exposed to
  // Python code. The file will be downloaded asynchronously and can be
  // accessed in Python once the returned promise resolves.
  async loadFile(url: string, name: string, pyodide: PyodideInterface) {
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    const bytes = new Uint8Array(buffer);

    pyodide.FS.writeFile(name, bytes);
  }
}
