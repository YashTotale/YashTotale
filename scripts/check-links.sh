#!/bin/bash

set -e

find . -name "*.md" | grep -v node_modules | grep -v README_OLD.md | while read -r line; do
  linkinator $line --markdown --config "$(pwd)/.linkinatorrc"
done
