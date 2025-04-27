# algos-java

This project implements a set of classes to manage and evaluate variants and their attributes in a structured way. It is designed to facilitate complex decision-making processes based on boolean expressions and conditions.

## Project Structure

```
algos-java
├── src
│   ├── main
│   │   ├── java
│   │   │   └── com
│   │   │       └── algos
│   │   │           └── complexity
│   │   │               └── tree
│   │   │                   ├── Attribute.java
│   │   │                   ├── Variant.java
│   │   │                   ├── Condition.java
│   │   │                   ├── Conditional.java
│   │   │                   ├── Part.java
│   │   │                   └── VariantNode.java
│   └── test
│       ├── java
│       │   └── com
│       │       └── algos
│       │           └── complexity
│       │               └── tree
│       │                   └── VariantNodeTest.java
├── pom.xml
└── README.md
```

## Classes Overview

- **Attribute**: Represents an attribute with a symbol and an optional boolean value.
- **Variant**: Represents a collection of attributes and provides methods to manipulate and evaluate them.
- **Condition**: Encapsulates a boolean expression and provides methods to evaluate it against a variant.
- **Conditional**: An abstract class that defines a method to retrieve a condition.
- **Part**: Extends `Conditional` and associates a name with a condition.
- **VariantNode**: Represents a node in a tree structure that holds variants and their relationships.

## Build and Run

This project uses Maven for dependency management and build automation. To build the project, navigate to the project root directory and run:

```
mvn clean install
```

To run the tests, use:

```
mvn test
```

## Dependencies

The project may include dependencies specified in the `pom.xml` file. Ensure that you have Maven installed to manage these dependencies.

## Contribution

Contributions are welcome! Please feel free to submit a pull request or open an issue for any enhancements or bug fixes.