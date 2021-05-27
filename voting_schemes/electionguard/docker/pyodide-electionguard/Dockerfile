FROM iodide/pyodide:0.16.1
LABEL author="david@codegram.com"

ENV PYODIDE_PACKAGES "pyasn1,libgmp,gmpy2,micropip,attrs,sortedcontainers,hypothesis,jsons,typish,rsa"

# Add base packages meta files
ADD packages /packages

# Copy files to the pyodide installation
RUN cp -rf /packages/* /src/pyodide/packages

WORKDIR /src/pyodide

# Compile base packages
RUN make