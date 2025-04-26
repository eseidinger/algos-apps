import { Component, OnInit } from '@angular/core';
import { loadPyodide, PyodideInterface } from 'pyodide';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-maze',
  imports: [MatButtonModule],
  templateUrl: './maze.component.html',
  styleUrl: './maze.component.scss'
})
export class MazeComponent implements OnInit {
  pyodide!: PyodideInterface;
  maze: string = '';

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

  init() {
    this.maze = this.pyodide.runPython(`
      from typing import NamedTuple, Optional, Callable
      from py_algos_eseidinger.generic_search.maze import Maze, MazeLocation
      from py_algos_eseidinger.generic_search.generic_search import (
          Node,
          dfs,
          node_to_path,
          bfs,
          astar,
          DFS,
      )

      m: Maze = Maze(sparseness=0.2)
      dfs_instance: DFS = DFS(m.start, m.goal_test, m.successors)
      str(m)
      `);
  }

  step() {
    this.maze = this.pyodide.runPython(`
      result = ''
      last_result = dfs_instance.step()
      if not last_result:
          current_solution: Optional[Node[MazeLocation]] = dfs_instance.current_node
          current_path = node_to_path(current_solution)
          current_frontier = [n.state for n in dfs_instance.frontier.content_copy()]
          m.mark_explored(dfs_instance.explored)
          m.mark_frontier(current_frontier)
          m.mark(current_path)
          result = str(m)
          m.clear(dfs_instance.explored)
          m.clear(current_frontier)
          m.clear(current_path)
      elif dfs_instance.solution is None:
          result = "No solution found with depth-first search!"
      else:
          solution: Optional[Node[MazeLocation]] = dfs_instance.solution
          path = node_to_path(solution)
          current_frontier = [n.state for n in dfs_instance.frontier.content_copy()]
          m.mark_explored(dfs_instance.explored)
          m.mark_frontier(current_frontier)
          m.mark(path)
          result = str(m)
          print(current_frontier)
          m.clear(dfs_instance.explored)
          m.clear(current_frontier)
          m.clear(path)
      result
          `);
  }
}
