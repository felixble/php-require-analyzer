# php-require-analyzer [Experimental]

Simple tool to analyze require and include statements of php scripts recursively.
The tool generates output in the dot format by default which can be displayed with [graphviz](https://www.graphviz.org/).

## Usage

* Install via `npm run i`
* Execute with node.js: node ./dist/main.js

```
Usage: main [options] <files>

Options:
  -g, --graph                    Draw graph (default)
  -l, --list                     List files
  -s, --scope [items]            Analysis scope (separated by space)
  -e, --exclude [items]          Files to exclude (separated by space)
  -r, --resolve [constant=path]  Files to exclude (separated by space)
  -h, --help                     output usage information
```

To run the tool and print the graph into a PDF file pipe the output to the `dot` utility:

```
node ./dist/main.js file.php | dot -ograph.pdf -T pdf
```