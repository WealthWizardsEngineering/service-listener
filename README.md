# Service Listener

The service listener is responsible for monitoring Kubernetes via the API and performing actions based on changes.

## Change Handlers

The service listener can perform multiple actions when a change notification is received from Kubernetes.

### Update Service Registry

When a deployment changes this will make sure that the service is stored in the service registry.

The baseUrl for an environment is determined from the ingress definition, if there is one.

Links are determined by annotations starting with 'link-', e.g. link-ping will be created in the service registry as a
link called 'ping'. Links should either start with http://, https:// or / - where the latter is a relative path from the
baseurl for the application, e.g. /ping

### Update Version Service

When a deployment changes this will try and query the "ping" endpoint of that deployed service and store the retrieved
version in the version service.

## Build

```
make install lint unit-test component-test dependency-check
```

## Configuration

The service listener access the Kubernetes API, which requires authenticated access. A user exists in all environments
called 'service-listener' for use by this service.

This user has been granted readonly access to all APIs, this may be locked down further.

* SERVICE_REGISTRY_URL - the URL for the [service registry](https://github.com/WealthWizardsEngineering/service-registry)
* VERSION_SERVICE_URL - the URL for the [version service](https://github.com/WealthWizardsEngineering/version-service)
* KUBERNETES_MASTER_URL - the URL the Kubernetes API
* KUBERNETES_NAMESPACES - the Kubernetes namespace(s) to interrogate as a comma separated list
* KUBERNETES_USERNAME - the Kubernetes username with permissions to interrogate the API
* KUBERNETES_PASSWORD - the Kubernetes password

## Running

```
docker run -e SERVICE_REGISTRY_URL=https://service-registry -e VERSION_SERVICE_URL=https://version-service -e KUBERNETES_MASTER_URL=https://kubernetes-api -e KUBERNETES_NAMESPACES=default,custom -e KUBERNETES_USERNAME=my-user -e KUBERNETES_PASSWORD=my-password quay.io/wealthwizards/service-listener
```
