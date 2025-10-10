from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth import authenticate, login, logout
from django.utils import timezone
from django.contrib.auth.hashers import make_password
from django.core.mail import send_mail
from django.conf import settings
import pyotp
import qrcode
import io
import base64
import secrets
import string

from .models import CustomUser, APIKey, UserSession, PasswordReset, TwoFactorAuth
from .serializers import (
    CustomUserSerializer, UserRegistrationSerializer, UserLoginSerializer,
    ChangePasswordSerializer, PasswordResetRequestSerializer, PasswordResetConfirmSerializer,
    APIKeySerializer, UserSessionSerializer, TwoFactorAuthSerializer,
    Enable2FASerializer, Verify2FASerializer
)


class UserRegistrationView(generics.CreateAPIView):
    """User registration endpoint"""
    queryset = CustomUser.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Create auth token
        token, created = Token.objects.get_or_create(user=user)
        
        return Response({
            'token': token.key,
            'user': CustomUserSerializer(user).data,
            'message': 'User registered successfully'
        }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """User login endpoint"""
    serializer = UserLoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        
        # Create or get token
        token, created = Token.objects.get_or_create(user=user)
        
        # Update last activity
        user.last_activity = timezone.now()
        user.save()
        
        return Response({
            'token': token.key,
            'user': CustomUserSerializer(user).data,
            'message': 'Login successful'
        }, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """User logout endpoint"""
    try:
        # Delete the user's token
        Token.objects.filter(user=request.user).delete()
        return Response({'message': 'Logout successful'}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class UserProfileView(generics.RetrieveUpdateAPIView):
    """User profile endpoint"""
    serializer_class = CustomUserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        return self.request.user


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password_view(request):
    """Change password endpoint"""
    serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        user = request.user
        new_password = serializer.validated_data['new_password']
        user.set_password(new_password)
        user.last_password_change = timezone.now()
        user.save()
        
        # Invalidate all existing tokens
        Token.objects.filter(user=user).delete()
        
        # Create new token
        token = Token.objects.create(user=user)
        
        return Response({
            'message': 'Password changed successfully',
            'token': token.key
        }, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def forgot_password_view(request):
    """Forgot password endpoint"""
    serializer = PasswordResetRequestSerializer(data=request.data)
    if serializer.is_valid():
        email = serializer.validated_data['email']
        try:
            user = CustomUser.objects.get(email=email)
            
            # Generate reset token
            reset_token = ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(64))
            
            # Create or update password reset record
            password_reset, created = PasswordReset.objects.update_or_create(
                user=user,
                defaults={
                    'token': reset_token,
                    'ip_address': request.META.get('REMOTE_ADDR', ''),
                    'expires_at': timezone.now() + timezone.timedelta(hours=24),
                    'used': False
                }
            )
            
            return Response({'message': 'Password reset email sent'}, status=status.HTTP_200_OK)
        
        except CustomUser.DoesNotExist:
            # Don't reveal if email exists or not
            return Response({'message': 'Password reset email sent'}, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password_view(request):
    """Reset password endpoint"""
    serializer = PasswordResetConfirmSerializer(data=request.data)
    if serializer.is_valid():
        token = serializer.validated_data['token']
        new_password = serializer.validated_data['new_password']
        
        try:
            password_reset = PasswordReset.objects.get(token=token)
            
            if password_reset.is_valid():
                user = password_reset.user
                user.set_password(new_password)
                user.last_password_change = timezone.now()
                user.save()
                
                # Mark token as used
                password_reset.used = True
                password_reset.used_at = timezone.now()
                password_reset.save()
                
                # Invalidate all existing tokens
                Token.objects.filter(user=user).delete()
                
                return Response({'message': 'Password reset successful'}, status=status.HTTP_200_OK)
            else:
                return Response({'error': 'Invalid or expired token'}, status=status.HTTP_400_BAD_REQUEST)
        
        except PasswordReset.DoesNotExist:
            return Response({'error': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class APIKeyViewSet(generics.ListCreateAPIView):
    """API Keys management"""
    serializer_class = APIKeySerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return APIKey.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        # Generate API key
        api_key = ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(64))
        serializer.save(user=self.request.user, key=api_key)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_api_key_view(request, key_id):
    """Delete API key endpoint"""
    try:
        api_key = APIKey.objects.get(id=key_id, user=request.user)
        api_key.delete()
        return Response({'message': 'API key deleted successfully'}, status=status.HTTP_200_OK)
    except APIKey.DoesNotExist:
        return Response({'error': 'API key not found'}, status=status.HTTP_404_NOT_FOUND)


class UserSessionListView(generics.ListAPIView):
    """List user sessions"""
    serializer_class = UserSessionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return UserSession.objects.filter(user=self.request.user)
