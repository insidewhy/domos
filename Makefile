.PHONY: client clean

PATH += :${PWD}/node_modules/.bin

O = build

client:
	six -co ${O} lib/*.six
	cp *.js ${O}
	cd ${O} && r.js -o build.js out=part.domos.min.js \
	        && r.js -o build.js out=part.domos.src.js optimize=none \
	        && cat prelude.js part.domos.src.js > domos.src.js \
	        && cat prelude.js part.domos.min.js > domos.min.js

clean:
	rm -rf build
