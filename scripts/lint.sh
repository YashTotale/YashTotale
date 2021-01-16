#!/bin/bash

GREEN='\e[92m'
NC='\033[0m'

set -e

lint() {
  markdownlinter
  printf "\n"
  prettierlinter
}

markdownlinter() {
  printf 'Linting with MarkdownLint...\n\n'

  markdownlint .

  printf "${GREEN}MarkdownLint Done${NC}\n"
}

prettierlinter() {
  printf 'Linting with Prettier...\n'

  prettier --check .

  printf "\n${GREEN}Prettier Done${NC}\n"
}

lint
