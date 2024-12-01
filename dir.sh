#!/bin/bash

# Create directory listing
find . -not -path '*/\.*' -not -path '*/node_modules/*' -not -path '*/dist/*' | \
sort | \
awk '
BEGIN {
    print "```"
    path="chrome-ext"
}
{
    split($0,parts,"/")
    depth=length(parts)-1
    name=parts[depth+1]
    if (name != ".") {
        for (i=1; i<depth; i++) printf "│   "
        if (depth > 0) printf "├── "
        print name
    }
}
END {
    print "```"
}' > structure.md