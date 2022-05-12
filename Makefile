# A bit silly, but maybe useful later

# SHELL=bash

DEFAULT_TEST=jest

HELP_TEXT="\n\
Help\n\
\tmake build   - typescript build\n\
"

help:
	@echo -e $(HELP_TEXT) | sed -e 's/^ //'

build:
	npm run build

dev:
	npm run dev

preview: build
	npm run preview
