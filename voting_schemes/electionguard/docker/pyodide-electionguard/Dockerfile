FROM pyodide/pyodide:0.17.0
LABEL author="hola@decidim.org"

ENV PYODIDE_PACKAGES "pyasn1,libgmp,gmpy2,micropip,attrs,sortedcontainers,hypothesis,jsons,typish,rsa"

# Install system dependencies
RUN apt-get update --allow-releaseinfo-change && apt-get install -y libgnutls28-dev m4

# Add base packages meta files
ADD packages /packages

# Copy files to the pyodide installation
RUN cp -rf /packages/* /src/pyodide/packages

WORKDIR /src/pyodide

# Compile base packages
RUN make