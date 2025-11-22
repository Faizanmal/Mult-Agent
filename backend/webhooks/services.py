"""
Service classes for webhook delivery and notification sending
"""
import requests
import logging
from django.utils import timezone
from .models import WebhookDelivery

logger = logging.getLogger(__name__)


class WebhookService:
    """Handle webhook delivery with retries"""
    
    def deliver_webhook(self, webhook, event_type, payload, attempt=1):
        """Deliver webhook payload to endpoint"""
        try:
            import time
            start_time = time.time()
            
            # Prepare headers
            headers = {
                'Content-Type': 'application/json',
                'X-Event-Type': event_type,
                'X-Webhook-Signature': self._generate_signature(webhook.secret_key, payload),
                **webhook.custom_headers
            }
            
            # Make request
            response = requests.post(
                webhook.url,
                json=payload,
                headers=headers,
                timeout=webhook.timeout_seconds
            )
            
            duration_ms = int((time.time() - start_time) * 1000)
            success = 200 <= response.status_code < 300
            
            # Create delivery record
            delivery = WebhookDelivery.objects.create(
                webhook=webhook,
                event_type=event_type,
                payload=payload,
                status_code=response.status_code,
                response_body=response.text[:1000],  # Limit response size
                success=success,
                attempt_number=attempt,
                duration_ms=duration_ms,
                delivered_at=timezone.now()
            )
            
            # Update webhook stats
            webhook.total_deliveries += 1
            if success:
                webhook.successful_deliveries += 1
            else:
                webhook.failed_deliveries += 1
            webhook.last_triggered = timezone.now()
            webhook.save()
            
            # Retry on failure
            if not success and webhook.retry_on_failure and attempt < webhook.max_retries:
                logger.info(f"Retrying webhook {webhook.name}, attempt {attempt + 1}")
                return self.deliver_webhook(webhook, event_type, payload, attempt + 1)
            
            return {
                'success': success,
                'status_code': response.status_code,
                'delivery_id': delivery.id
            }
            
        except Exception as e:
            logger.error(f"Webhook delivery failed: {str(e)}")
            
            # Create failed delivery record
            delivery = WebhookDelivery.objects.create(
                webhook=webhook,
                event_type=event_type,
                payload=payload,
                success=False,
                error_message=str(e),
                attempt_number=attempt
            )
            
            webhook.total_deliveries += 1
            webhook.failed_deliveries += 1
            webhook.save()
            
            # Retry on exception
            if webhook.retry_on_failure and attempt < webhook.max_retries:
                return self.deliver_webhook(webhook, event_type, payload, attempt + 1)
            
            return {
                'success': False,
                'error': str(e),
                'delivery_id': delivery.id
            }
    
    def _generate_signature(self, secret_key, payload):
        """Generate HMAC signature for webhook"""
        import hmac
        import hashlib
        import json
        
        message = json.dumps(payload, sort_keys=True).encode()
        signature = hmac.new(
            secret_key.encode(),
            message,
            hashlib.sha256
        ).hexdigest()
        
        return signature


class NotificationService:
    """Handle multi-channel notifications"""
    
    def send_notification(self, channel, title, message, event_type, data=None):
        """Send notification through specified channel"""
        from .models import WebhookNotification
        
        try:
            # Create notification record
            notification = WebhookNotification.objects.create(
                user=channel.user,
                channel=channel,
                event_type=event_type,
                title=title,
                message=message,
                data=data or {}
            )
            
            # Send based on channel type
            if channel.channel_type == 'email':
                result = self._send_email(channel, title, message)
            elif channel.channel_type == 'slack':
                result = self._send_slack(channel, title, message)
            elif channel.channel_type == 'discord':
                result = self._send_discord(channel, title, message)
            elif channel.channel_type == 'telegram':
                result = self._send_telegram(channel, title, message)
            else:
                result = {'success': False, 'error': 'Unsupported channel type'}
            
            # Update notification status
            if result.get('success'):
                notification.is_sent = True
                notification.sent_at = timezone.now()
                notification.save()
            
            return result
            
        except Exception as e:
            logger.error(f"Notification send failed: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def _send_email(self, channel, title, message):
        """Send email notification"""
        # TODO: Implement email sending
        logger.info(f"Email notification: {title}")
        return {'success': True, 'channel': 'email'}
    
    def _send_slack(self, channel, title, message):
        """Send Slack notification"""
        try:
            webhook_url = channel.channel_config.get('webhook_url')
            if not webhook_url:
                return {'success': False, 'error': 'No webhook URL configured'}
            
            payload = {
                'text': f"*{title}*\n{message}"
            }
            
            response = requests.post(webhook_url, json=payload, timeout=10)
            return {'success': response.status_code == 200}
            
        except Exception as e:
            logger.error(f"Slack notification failed: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def _send_discord(self, channel, title, message):
        """Send Discord notification"""
        try:
            webhook_url = channel.channel_config.get('webhook_url')
            if not webhook_url:
                return {'success': False, 'error': 'No webhook URL configured'}
            
            payload = {
                'embeds': [{
                    'title': title,
                    'description': message,
                    'color': 3447003  # Blue color
                }]
            }
            
            response = requests.post(webhook_url, json=payload, timeout=10)
            return {'success': 200 <= response.status_code < 300}
            
        except Exception as e:
            logger.error(f"Discord notification failed: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def _send_telegram(self, channel, title, message):
        """Send Telegram notification"""
        # TODO: Implement Telegram Bot API
        logger.info(f"Telegram notification: {title}")
        return {'success': True, 'channel': 'telegram'}
