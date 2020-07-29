# Service Listener

The service listener is responsible for monitoring Kubernetes via the API and performing actions based on changes.

## Change Handlers

The service listener can perform multiple actions when a change notification is received from Kubernetes. These are
the change handlers, and are documented below:

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
* KUBERNETES_NAMESPACES - the Kubernetes namespace(s) to interrogate as a comma separated list

Access to the kubernetes api is via a cluster role, you will need something like this:

```
apiVersion: v1
kind: ServiceAccount
metadata:
  name: service-listener
---
kind: ClusterRole
apiVersion: rbac.authorization.k8s.io/v1
metadata:
  labels:
    k8s-app: service-listener
  name: service-listener
rules:
  - apiGroups: ["*"]
    resources: ["*"]
    verbs: ["get", "list", "watch"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: service-listener
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: service-listener
subjects:
  - kind: ServiceAccount
    name: service-listener
---
kind: Deployment
apiVersion: apps/v1
spec:
  template:
    spec:
      serviceAccountName: service-listener
 ...
```

## Running locally

By default running will mount your home ~/.kube directory in order to use the default kubernetes config file for talking
to a cluster.

```
make run
```
