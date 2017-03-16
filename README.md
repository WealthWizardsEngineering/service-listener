# Service Listener

The service listener is responsible for monitoring Kubernetes via the API and performing actions based on changes.

## Change Handlers

The service listener can peform multiple actions when a change notification is received from Kubernetes.

### Update Service Registry

When a deployment changes this will make sure that the service is stored in the service registry.

The baseUrl for an environment is determined from the ingress definition, if there is one.

Links are determined by annotations starting with 'link-', e.g. link-ping will be created in the service registry as a link called 'ping'. Links should either start with http://, https:// or / - where the latter is a relative path from the baseurl for the application, e.g. /ping

## Configuration

The service listener access the Kubernetes API, which requires authenticated access. A user exists in all environments called 'service-listener' for use by this service.

This user has been granted readonly access to all APIs, this may be locked down further.

abac-authz-policy.jsonl

```
{
  "apiVersion": "abac.authorization.kubernetes.io/v1beta1",
  "kind": "Policy",
  "spec":
  {
    "user":"service-listener",
    "readonly":true,
    "namespace": "*",
    "resource": "*",
    "apiGroup": "*",
    "nonResourcePath": "*"
  }
}
```
