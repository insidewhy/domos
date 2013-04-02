.PHONY: package js html style clean gh-pages watch

PATH += :${PWD}/node_modules/.bin

O = build

package: js html style

js:
	six -co ${O} lib/*.six
	cp *.js ${O}
	cd ${O} && r.js -o build.js out=part.domos.min.js \
	        && r.js -o build.js out=part.domos.src.js optimize=none \
	        && cat prelude.js part.domos.src.js > domos.src.js \
	        && cat prelude.js part.domos.min.js > domos.min.js

html: ${O}/index.html

style: ${O}/index.css

${O}/%.html: test/%.jade
	jade -O ${O} $<

${O}/%.css: test/%.scss
	scss --compass --update test:${O}

clean:
	rm -rf build

gh-pages: package
	git co gh-pages
	cp build/domos.src.js build/domos.min.js build/*.{html,css} .
	git commit -a
	git push
	git co master

watch:
	./node_modules/.bin/six watch.six
