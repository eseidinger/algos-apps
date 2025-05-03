# Python Algorithms

A collection of data structures and algorithms in Python with applications in mobile and web applications.
Includes ports to other languages, such as Java and TypeScript.

## Python Development

### Create Virtual Environment

```
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Build Python Package

```
python -m build
# or build with Hatch
hatch build
```

### Run Tests

```
pip install .
pytest
```

### Publish Python Package

```
twine upload --repository testpypi dist/*
```
