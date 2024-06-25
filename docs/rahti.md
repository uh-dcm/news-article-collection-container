# Rahti 2

The application runs on a [RedHat OpenShift](https://en.wikipedia.org/wiki/OpenShift) based container hosting service called
**Rahti 2**. To get started, see the [Rahti2 documentation](https://docs.csc.fi/cloud/rahti2/).

Rahti 2 runs in **projects** that can be operated either via the web interface or the OpenShift CLI tool `oc`. 
See [this](https://docs.csc.fi/cloud/rahti2/access/).

## Setting up an environment using the web interface

1. See the instructions on [how to apply for Rahti 2 access](https://docs.csc.fi/cloud/rahti2/access/)
2. [Login to Rahti 2](https://docs.csc.fi/cloud/rahti2/usage/getting_started/) from [https://rahti.csc.fi](https://rahti.csc.fi).
3. Once logged in, click `+Add` from the left hand side panel.
4. Choose "Container images"
    1. Choose "Image name from external registry" and type `ohtukontitus/news-collection:latest`
    2. Choose an application name and name for your component and click create
5. Go to "Topology", click the newly created deployment and click "Add storage".
    1. Choose "Create new claim"
    2. Choose a name for your `PersistentVolumeClaim` manifest
    3. In "Size", choose a capcity of `1 GiB`
    4. In "Mount path" type `/app/server/rss-fetcher/data`
    5. Click "Save"
6. Go back to "Topology". You should be able to access the app by left clicking the deployment and going to the URL under "Location".

## Setting up an environment using the OpenShift CLI tool

*Todo*
