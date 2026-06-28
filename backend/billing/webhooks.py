import json
import stripe
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from authentication.models import Workspace

@csrf_exempt
def stripe_webhook(request):
    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
    endpoint_secret = getattr(settings, 'STRIPE_WEBHOOK_SECRET', 'whsec_dummy')
    
    event = None

    try:
        if endpoint_secret != 'whsec_dummy':
            event = stripe.Webhook.construct_event(
                payload, sig_header, endpoint_secret
            )
        else:
            # Fallback for local testing without signature verification
            event = stripe.Event.construct_from(json.loads(payload), stripe.api_key)
    except ValueError:
        return HttpResponse(status=400)
    except stripe.error.SignatureVerificationError:
        return HttpResponse(status=400)

    # Handle the event
    if event.type == 'checkout.session.completed':
        session = event.data.object
        workspace_id = session.metadata.get('workspace_id')
        if workspace_id:
            try:
                workspace = Workspace.objects.get(id=workspace_id)
                workspace.subscription_tier = 'pro' # Assign tier based on price_id logically
                workspace.save()
            except Workspace.DoesNotExist:
                pass
                
    elif event.type == 'customer.subscription.updated':
        # Update our Subscription model
        pass
        
    elif event.type == 'customer.subscription.deleted':
        # Mark as canceled
        pass

    return HttpResponse(status=200)
