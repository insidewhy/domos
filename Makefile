.PHONY: package js test-html test-style clean gh-pages watch

PATH += :${PWD}/node_modules/.bin

O = build

package: js test-html

js:
	six -co ${O} lib/*.six
	cp *.js ${O}
	cd ${O} && r.js -o build.js out=part.domos.min.js \
	        && r.js -o build.js out=part.domos.src.js optimize=none \
	        && cat prelude.js part.domos.src.js > domos.src.js \
	        && cat prelude.js part.domos.min.js > domos.min.js

test-html: ${O}/test/index.html

test-style: ${O}/test/index.css

${O}/test/%.html: test/%.jade
	jade -O ${O}/test $<

${O}/test/%.css: test/%.scss
	scss --compass --update test:${O}/test

clean:
	rm -rf build

gh-pages: package
	git co gh-pages
	cp build/domos.src.js build/domos.min.js build/test/index.html .

watch:
	./node_modules/.bin/six watch.six
