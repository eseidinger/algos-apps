import { Component } from '@angular/core';
import { Attribute, Condition, Part, Variant, VariantNode } from './tree/variant-node';
import { constructVariantTree } from './tree/tree-utils';
import { BooleanExpression } from './tree/boolean-expression';
import { MatTreeModule } from '@angular/material/tree';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-complexity',
  imports: [MatTreeModule, MatIconModule],
  templateUrl: './complexity.component.html',
  styleUrl: './complexity.component.scss'
})
export class ComplexityComponent {
  childrenAccessor = (node: VariantNode) => node.children;
  
  dataSource: VariantNode[] = [];

  hasChild = (_: number, node: VariantNode) => node.children.length > 0;

  constructor() {

  }

  ngOnInit() {
    const part1 = new Part('Part 1', new Condition(new BooleanExpression('B & (A | C)')));
    const part2 = new Part('Part 2', new Condition(new BooleanExpression('C & (A | B)')));


    const variant1 = new Variant([new Attribute("A", true), new Attribute("B", true), new Attribute("C", false)]);
    const variant2 = new Variant([new Attribute("A", true), new Attribute("B", false), new Attribute("C", true)]);
    const variant3 = new Variant([new Attribute("A", false), new Attribute("B", true), new Attribute("C", true)]);

    const tree = constructVariantTree(
      [variant1, variant2, variant3], ["A", "B", "C"], [part1, part2]
    );

    this.dataSource = [tree];
  }
}
