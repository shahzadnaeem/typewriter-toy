# A bit silly, but maybe useful later

# SHELL=bash

DEFAULT_TEST=jest

HELP_TEXT="\n\
Help\n\
\tmake dev     - vite dev loop\n\
\tmake build   - typescript build\n\
\tmake preview - run built version\n\
"

help:
	@echo -e $(HELP_TEXT) | sed -e 's/^ //'

build:
	npm run build

dev:
	npm run dev

preview: build
	npm run preview

PROJECTDIR=dist

surge: build
	surge --domain https://shaz-typewriter-toy.surge.sh $(PROJECTDIR) shaz-typewriter-toy.surge.sh

