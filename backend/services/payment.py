from config import get_settings
from services.auth import AuthService


class PaymentService:
    def __init__(self):
        self.settings = get_settings()
        self.auth_service = AuthService()
        
        if self.settings.stripe_enabled:
            import stripe
            stripe.api_key = self.settings.stripe_secret_key
            self.stripe = stripe
        else:
            self.stripe = None
    
    def create_checkout_session(self, user_id: str, success_url: str, cancel_url: str) -> dict:
        if not self.settings.stripe_enabled:
            raise ValueError("Payment processing is not configured. Contact administrator.")
        
        user = self.auth_service.get_user_by_id(user_id)
        
        if not user:
            raise ValueError("User not found")
        
        if user.is_paid:
            raise ValueError("User is already a paid subscriber")
        
        customer = self.stripe.Customer.create(
            email=user.email,
            metadata={"user_id": user_id}
        )
        
        session = self.stripe.checkout.Session.create(
            customer=customer.id,
            payment_method_types=["card"],
            line_items=[{
                "price": self.settings.stripe_price_id,
                "quantity": 1,
            }],
            mode="subscription",
            success_url=success_url,
            cancel_url=cancel_url,
            metadata={"user_id": user_id}
        )
        
        return {
            "session_id": session.id,
            "url": session.url
        }
    
    def handle_webhook(self, payload: bytes, sig_header: str) -> dict:
        if not self.settings.stripe_enabled:
            raise ValueError("Payment processing is not configured")
        
        try:
            event = self.stripe.Webhook.construct_event(
                payload, sig_header, self.settings.stripe_webhook_secret
            )
        except ValueError:
            raise ValueError("Invalid payload")
        except self.stripe.error.SignatureVerificationError:
            raise ValueError("Invalid signature")
        
        if event["type"] == "checkout.session.completed":
            session = event["data"]["object"]
            user_id = session["metadata"]["user_id"]
            customer_id = session["customer"]
            
            self.auth_service.upgrade_to_paid(user_id, customer_id)
            
            return {"status": "success", "message": "User upgraded to paid"}
        
        elif event["type"] == "customer.subscription.deleted":
            customer_id = event["data"]["object"]["customer"]
            
            from services.database import DatabaseService
            db = DatabaseService()
            result = db.select("users").eq("stripe_customer_id", customer_id).execute()
            
            if result.data:
                user_id = result.data[0]["id"]
                self.auth_service.update_user(user_id, {
                    "is_paid": False,
                    "max_tokens": self.settings.free_user_max_tokens
                })
            
            return {"status": "success", "message": "Subscription cancelled"}
        
        return {"status": "ignored", "message": "Event type not handled"}
    
    def cancel_subscription(self, user_id: str) -> dict:
        if not self.settings.stripe_enabled:
            raise ValueError("Payment processing is not configured")
        
        user = self.auth_service.get_user_by_id(user_id)
        
        if not user or not user.stripe_customer_id:
            raise ValueError("User not found or not subscribed")
        
        subscriptions = self.stripe.Subscription.list(customer=user.stripe_customer_id)
        
        for subscription in subscriptions.data:
            self.stripe.Subscription.delete(subscription.id)
        
        return {"status": "success", "message": "Subscription cancelled"}
