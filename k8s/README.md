# Kubernetes Deployment Guide

This directory contains Kubernetes manifests for deploying the Multi-Agent System.

## Files

- `deployment.yaml` - Main deployment for backend, frontend, and Redis
- `hpa.yaml` - Horizontal Pod Autoscalers for auto-scaling based on CPU/memory
- `config.yaml` - ConfigMaps and Secrets for configuration
- `ingress.yaml` - Ingress rules for external access (optional)

## Prerequisites

1. Kubernetes cluster (v1.24+)
2. kubectl configured
3. Metrics Server installed (for HPA)
4. Ingress controller (optional, for ingress.yaml)

## Quick Start

### 1. Create Namespace

```bash
kubectl create namespace multi-agent-system
kubectl config set-context --current --namespace=multi-agent-system
```

### 2. Configure Secrets

Edit `config.yaml` and replace placeholder values:

```bash
# Edit secrets
nano config.yaml

# Apply configuration
kubectl apply -f config.yaml
```

### 3. Deploy Services

```bash
# Deploy Redis
kubectl apply -f deployment.yaml

# Wait for Redis to be ready
kubectl wait --for=condition=ready pod -l app=redis --timeout=60s

# Deploy Backend
kubectl apply -f deployment.yaml

# Deploy Frontend
kubectl apply -f deployment.yaml
```

### 4. Enable Auto-Scaling

```bash
# Install metrics-server if not installed
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

# Apply HPA
kubectl apply -f hpa.yaml
```

### 5. Access Services

```bash
# Get service URLs
kubectl get services

# Port forward for local access
kubectl port-forward service/backend-service 8000:8000
kubectl port-forward service/frontend-service 3000:3000
```

## Monitoring

### Check Pod Status

```bash
kubectl get pods
kubectl describe pod <pod-name>
kubectl logs <pod-name>
```

### Check HPA Status

```bash
kubectl get hpa
kubectl describe hpa backend-hpa
kubectl describe hpa frontend-hpa
```

### Monitor Resource Usage

```bash
kubectl top pods
kubectl top nodes
```

## Scaling

### Manual Scaling

```bash
# Scale backend replicas
kubectl scale deployment backend-deployment --replicas=5

# Scale frontend replicas
kubectl scale deployment frontend-deployment --replicas=3
```

### Auto-Scaling Configuration

HPA is configured to:
- **Backend**: 3-20 replicas based on 70% CPU, 80% memory
- **Frontend**: 2-10 replicas based on 70% CPU, 75% memory

Scale-up is aggressive (100% or 4 pods every 30s)
Scale-down is gradual (50% or 2 pods every 60s, with 5min stabilization)

## Production Recommendations

### 1. Resource Requests/Limits

Current configuration:

**Backend:**
- Requests: 512Mi memory, 500m CPU
- Limits: 2Gi memory, 2000m CPU

**Frontend:**
- Requests: 256Mi memory, 250m CPU
- Limits: 1Gi memory, 1000m CPU

Adjust based on your workload.

### 2. Persistence

Redis uses PersistentVolumeClaim (10Gi). Ensure:
- StorageClass supports RWO (ReadWriteOnce)
- Backups are configured
- Consider Redis Cluster for high availability

### 3. High Availability

For production:
- Backend: min 3 replicas across availability zones
- Frontend: min 2 replicas
- Redis: Use Redis Cluster or managed service (Azure Cache for Redis)
- Database: Use managed PostgreSQL (Azure Database for PostgreSQL)

### 4. Security

- Use NetworkPolicies to restrict traffic
- Enable RBAC
- Use separate namespaces for dev/staging/prod
- Rotate secrets regularly
- Enable Pod Security Policies

### 5. Monitoring & Logging

Install:
- Prometheus + Grafana for metrics
- ELK Stack or Azure Monitor for logs
- Jaeger/Zipkin for distributed tracing

### 6. Ingress (External Access)

Create `ingress.yaml`:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: multi-agent-ingress
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  ingressClassName: nginx
  tls:
  - hosts:
    - api.yourdomain.com
    - app.yourdomain.com
    secretName: multi-agent-tls
  rules:
  - host: api.yourdomain.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: backend-service
            port:
              number: 8000
  - host: app.yourdomain.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend-service
            port:
              number: 3000
```

## Troubleshooting

### Pods Not Starting

```bash
kubectl describe pod <pod-name>
kubectl logs <pod-name>
```

Common issues:
- Missing secrets
- Image pull errors
- Resource limits exceeded

### HPA Not Scaling

```bash
kubectl describe hpa <hpa-name>
```

Common issues:
- Metrics server not installed
- Resource requests not defined
- Insufficient cluster resources

### Database Connection Issues

Check secrets:
```bash
kubectl get secret multi-agent-secrets -o yaml
```

Verify database URL and credentials.

## Cleanup

```bash
# Delete all resources
kubectl delete -f hpa.yaml
kubectl delete -f deployment.yaml
kubectl delete -f config.yaml

# Delete namespace
kubectl delete namespace multi-agent-system
```

## Azure Kubernetes Service (AKS)

### Deploy to AKS

```bash
# Create AKS cluster
az aks create \
  --resource-group myResourceGroup \
  --name myAKSCluster \
  --node-count 3 \
  --node-vm-size Standard_D4s_v3 \
  --enable-managed-identity \
  --enable-cluster-autoscaler \
  --min-count 3 \
  --max-count 10

# Get credentials
az aks get-credentials --resource-group myResourceGroup --name myAKSCluster

# Deploy
kubectl apply -f config.yaml
kubectl apply -f deployment.yaml
kubectl apply -f hpa.yaml
```

### Use Azure Services

Consider using managed Azure services:
- Azure Database for PostgreSQL
- Azure Cache for Redis
- Azure Container Registry (ACR)
- Azure Monitor
- Azure Key Vault for secrets

## Cost Optimization

1. **Right-size resources**: Monitor actual usage and adjust requests/limits
2. **Use spot instances**: For non-critical workloads
3. **Enable cluster autoscaler**: Scale nodes based on demand
4. **Use PodDisruptionBudgets**: Ensure availability during updates
5. **Implement caching**: Reduce model API calls

## Support

For issues:
1. Check pod logs: `kubectl logs <pod-name>`
2. Check events: `kubectl get events`
3. Review application logs
4. Check Azure Monitor (if using AKS)
