import { Component } from '@angular/core';
import { Attribute, Condition, Part, Variant } from './tree/variant-node';
import { constructVariantTree, printTree } from './tree/tree-utils';
import { BooleanExpression } from './tree/boolean-expression';

@Component({
  selector: 'app-complexity',
  imports: [],
  templateUrl: './complexity.component.html',
  styleUrl: './complexity.component.scss'
})
export class ComplexityComponent {

  ngOnInit() {
    const part1 = new Part('Part 1', new Condition(new BooleanExpression('B & (A | C)')));
    const part2 = new Part('Part 2', new Condition(new BooleanExpression('C & (A | B)')));


    const variant1 = new Variant([new Attribute("A", true), new Attribute("B", true), new Attribute("C", false)]);
    const variant2 = new Variant([new Attribute("A", true), new Attribute("B", false), new Attribute("C", true)]);
    const variant3 = new Variant([new Attribute("A", false), new Attribute("B", true), new Attribute("C", true)]);

    const tree = constructVariantTree(
      [variant1, variant2, variant3], ["A", "B", "C"], [part1, part2]
    );

    console.log("Before collapsing:");
    printTree(tree);

    tree.collapse(["B"], ["C"]);
    console.log("\nAfter collapsing:");
    printTree(tree);
    console.log("\n");

    console.log("Tree with only two symbols:");
    const tree2 = constructVariantTree(
      [variant1, variant2, variant3], ["A", "B"], [part1, part2]
    );
    printTree(tree2);
  }
}
