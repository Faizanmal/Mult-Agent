import stripe
from django.conf import settings

# Use a dummy key if not set in environment
stripe.api_key = getattr(settings, 'STRIPE_SECRET_KEY', 'sk_test_dummy')

def create_checkout_session(workspace, price_id, success_url, cancel_url):
    """
    Creates a Stripe Checkout Session for a given workspace to subscribe to a plan.
    """
    # Create or get Stripe Customer ID
    if not workspace.stripe_customer_id:
        customer = stripe.Customer.create(
            email=workspace.memberships.first().user.email if workspace.memberships.exists() else None,
            name=workspace.name,
            metadata={'workspace_id': str(workspace.id)}
        )
        workspace.stripe_customer_id = customer.id
        workspace.save()

    session = stripe.checkout.Session.create(
        customer=workspace.stripe_customer_id,
        payment_method_types=['card'],
        line_items=[{
            'price': price_id,
            'quantity': 1,
        }],
        mode='subscription',
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={'workspace_id': str(workspace.id)}
    )
    return session.url

def get_customer_portal(workspace, return_url):
    """
    Generate a Stripe Customer Portal link so users can manage their subscription.
    """
    if not workspace.stripe_customer_id:
        raise ValueError("Workspace does not have a Stripe Customer ID")
        
    session = stripe.billing_portal.Session.create(
        customer=workspace.stripe_customer_id,
        return_url=return_url
    )
    return session.url
