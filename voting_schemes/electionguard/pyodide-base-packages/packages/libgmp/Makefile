PYODIDE_ROOT=$(abspath ../..)
include ../../Makefile.envs

LIBGMPVERSION=6.2.1

ROOT=$(abspath .)

SRC=$(ROOT)/gmp-$(LIBGMPVERSION)
TARBALL=$(ROOT)/downloads/gmp-$(LIBGMPVERSION).tar.xz
URL=https://gmplib.org/download/gmp/gmp-$(LIBGMPVERSION).tar.xz


all: $(SRC)/.libs/libgmp.a


clean:
	-rm -fr downloads
	-rm -fr $(SRC)


$(TARBALL):
	[ -d $(ROOT)/downloads ] || mkdir $(ROOT)/downloads
	wget -q -O $@ $(URL)
	sha256sum --quiet --check checksums || (rm $@; false)


$(SRC)/Makefile: $(TARBALL)
	tar -C . -xf $(TARBALL)
	touch $(SRC)/Makefile


$(SRC)/.libs/libgmp.a: $(SRC)/Makefile
	( \
		cd $(SRC) ; \
		gmp_asm_syntax_testing=no emconfigure ./configure \
			--disable-assembly \
			--disable-assert \
			--disable-shared ; \
		emmake make -j $${PYODIDE_JOBS:-3} ; \
	)
	touch $(SRC)/.libs/libgmp.a
