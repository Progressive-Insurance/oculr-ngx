# Copyright (c) 2021 Progressive Casualty Insurance Company. All rights reserved.
#
# Progressive-owned, no external contributions.

FROM clo-base-image-registry.3d.prci.com/rhscl/nodejs-14-rhel7:latest as builder

SHELL ["/bin/bash", "-c"]
USER root

ARG NPM_CONFIG__auth
ARG PUBLISH

ENV NPM_CONFIG_NODEJS_ORG_MIRROR=https://progressive.jfrog.io/progressive/pgr-nodejs
ENV NPM_CONFIG_registry=https://progressive.jfrog.io/progressive/api/npm/pgr-npm/
ENV NPM_CONFIG_strict_ssl=true
ENV NPM_CONFIG_always_auth=true
ENV NPM_CONFIG_cafile=/usr/local/share/ca-certificates/ca.crt

ENV http_proxy=http://servercache.3d.prci.com:55000
ENV https_proxy=${http_proxy}
ENV no_proxy=.hclscloud.net,.icmlab.com,.local,.prci.com,.prog1.com,.progdmz.com,.proghsz.com,.proghszq.com,.prog1d.com,.prog1qa.com,.pgrapps.com,.pgrappsdev.com,.pgrappsqa.com,ihost.mymitchell.com,lyncdiscoverinternal.progressive.com,pgrlogin.progressive.com,127.0.0.1,tfsprod,tfsqa,pgr,pgrsites,pgrmysites,highway,localhost,remedy,srm,artifactory,*.progressive*.au,airwatch*.progressive.com,pgrcmgdev.*,10.*,170.218.*,192.168.*,12.149.101.*,199.244.232.*,198.181.158.*,69.39.184.*,66.201.66.36,*.intr.*,*surance*.au,*myvpc*,*xradmhub*

COPY --chown=default:root . .

RUN curl -o /etc/pki/ca-trust/source/anchors/ca.crt http://crl3.prci.com/Progressive%20PKI%20G3.ca-bundle.crt && update-ca-trust

# TODO Temporary workaround until esbuild can fix the issue or we can upgrade nodejs (https://github.com/netlify/cli/issues/1870)
RUN npm install --unsafe-perm=true
RUN npm run build

RUN tar -czf node_modules.tar.gz node_modules && \
  tar -czf src.tar.gz projects/monocle-ngx/src && \
  tar -C dist -czf dist.tar.gz ./


FROM docker-registry-default.d-ocp.prci.com/ps-online-servicing-dev/chrome-image-master:latest AS unit-test

SHELL ["/bin/bash", "-c"]
USER default
WORKDIR /opt/app-root/src

# Copy app from builder image
COPY --from=builder --chown=default:root /opt/app-root/src/*.json /opt/app-root/src/
COPY --from=builder --chown=default:root /opt/app-root/src/src.tar.gz /opt/app-root/src
COPY --from=builder --chown=default:root /opt/app-root/src/dist.tar.gz  /opt/app-root/src
COPY --from=builder --chown=default:root /opt/app-root/src/node_modules.tar.gz /opt/app-root/src

# Extract node_modules and src folders
RUN tar -hxf node_modules.tar.gz && \
  tar -xf src.tar.gz && \
  tar -xf dist.tar.gz

# Fix permission issue with NPM .config
USER root
RUN chown -R default:root .config
USER default

# Execute unit tests
RUN npm run test:ci

WORKDIR /opt/app-root/src/dist/monocle-ngx
RUN if [ "$PUBLISH" = "true" ] ; then npm publish --registry https://$ARTIFACTORY_USER:$ARTIFACTORY_TOKEN@progressive.jfrog.io/progressive/api/npm/pgr-npm ; fi
