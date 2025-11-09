"""
JWT Authentication for Enterprise-grade security
"""
from rest_framework import authentication, exceptions
from django.conf import settings
from django.contrib.auth import get_user_model
import jwt
from datetime import datetime, timedelta
import logging

User = get_user_model()
logger = logging.getLogger(__name__)


class JWTAuthentication(authentication.BaseAuthentication):
    """
    JWT authentication with refresh tokens and token rotation
    """
    
    authentication_header_prefix = 'Bearer'
    
    def authenticate(self, request):
        """
        Authenticate request using JWT token
        """
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        
        if not auth_header:
            return None
        
        try:
            prefix, token = auth_header.split(' ')
            
            if prefix.lower() != self.authentication_header_prefix.lower():
                return None
            
            return self._authenticate_credentials(token)
            
        except ValueError:
            raise exceptions.AuthenticationFailed('Invalid authorization header format')
    
    def _authenticate_credentials(self, token):
        """
        Validate JWT token and return user
        """
        try:
            payload = jwt.decode(
                token,
                settings.SECRET_KEY,
                algorithms=['HS256']
            )
        except jwt.ExpiredSignatureError:
            raise exceptions.AuthenticationFailed('Token has expired')
        except jwt.InvalidTokenError:
            raise exceptions.AuthenticationFailed('Invalid token')
        
        try:
            user = User.objects.get(id=payload['user_id'])
        except User.DoesNotExist:
            raise exceptions.AuthenticationFailed('User not found')
        
        if not user.is_active:
            raise exceptions.AuthenticationFailed('User account is disabled')
        
        return (user, token)


def generate_access_token(user):
    """
    Generate access token with short expiration
    """
    payload = {
        'user_id': str(user.id),
        'email': user.email,
        'username': user.username,
        'exp': datetime.utcnow() + timedelta(minutes=15),  # 15 minutes
        'iat': datetime.utcnow(),
        'type': 'access'
    }
    
    return jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')


def generate_refresh_token(user):
    """
    Generate refresh token with long expiration
    """
    payload = {
        'user_id': str(user.id),
        'exp': datetime.utcnow() + timedelta(days=7),  # 7 days
        'iat': datetime.utcnow(),
        'type': 'refresh'
    }
    
    return jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')


def refresh_access_token(refresh_token):
    """
    Generate new access token from refresh token
    """
    try:
        payload = jwt.decode(
            refresh_token,
            settings.SECRET_KEY,
            algorithms=['HS256']
        )
        
        if payload.get('type') != 'refresh':
            raise exceptions.AuthenticationFailed('Invalid token type')
        
        user = User.objects.get(id=payload['user_id'])
        
        return generate_access_token(user)
        
    except jwt.ExpiredSignatureError:
        raise exceptions.AuthenticationFailed('Refresh token has expired')
    except jwt.InvalidTokenError:
        raise exceptions.AuthenticationFailed('Invalid refresh token')
    except User.DoesNotExist:
        raise exceptions.AuthenticationFailed('User not found')
